import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Role {
  role_id: number;
  role_name: string;
  role_display_name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: Role[] | null;
}

interface RoleOption {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface AddUserProps {
  user?: User;
  onBack: () => void;
  onMenuClick: () => void;
}

export default function AddUser({ user, onBack, onMenuClick }: AddUserProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [existingInvite, setExistingInvite] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    is_active: user?.is_active ?? true,
    role_ids: user?.roles?.map(r => r.role_id) || [] as number[]
  });

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadExistingInvite(user.id);
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles');
      const data = await response.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните все обязательные поля'
      });
      return;
    }

    if (formData.role_ids.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Выберите хотя бы одну роль'
      });
      return;
    }

    setIsSaving(true);

    try {
      const isEdit = !!user;
      const url = isEdit
        ? `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users&id=${user.id}`
        : 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения пользователя');
      }

      // Если создаём нового пользователя, генерируем инвайт-ссылку
      if (!isEdit) {
        const userId = data.id;
        const inviteResponse = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });

        const inviteData = await inviteResponse.json();

        if (inviteResponse.ok && inviteData.invite_link) {
          setInviteLink(inviteData.invite_link);
          setShowInviteSection(true);
          
          toast({
            title: 'Пользователь создан',
            description: 'Инвайт-ссылка сгенерирована успешно'
          });
        } else {
          toast({
            title: 'Пользователь создан',
            description: 'Но не удалось создать инвайт-ссылку'
          });
          onBack();
        }
      } else {
        toast({
          title: 'Успешно',
          description: 'Пользователь обновлён'
        });
        onBack();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить пользователя'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadExistingInvite = async (userId: number) => {
    setLoadingInvite(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites&action=user_invite&user_id=${userId}`);
      const data = await response.json();
      console.log('Загрузка инвайта для user_id:', userId, 'результат:', data);
      if (data.invite) {
        setExistingInvite(data.invite);
      } else {
        setExistingInvite(null);
      }
    } catch (error) {
      console.error('Ошибка загрузки инвайта:', error);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleRegenerateInvite = async () => {
    if (!user?.id) return;
    
    setRegeneratingInvite(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites&action=regenerate&user_id=${user.id}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok && data.invite_link) {
        setExistingInvite(data);
        toast({
          title: 'Инвайт обновлён',
          description: 'Старая ссылка больше не работает'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить инвайт'
      });
    } finally {
      setRegeneratingInvite(false);
    }
  };

  const handleCopyInvite = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Скопировано',
      description: 'Инвайт-ссылка скопирована в буфер обмена'
    });
  };



  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={user ? 'Редактировать пользователя' : 'Добавить пользователя'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowCancelDialog(true)}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">ФИО *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Логин *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ivanov"
                      disabled={!!user}
                    />
                    {user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Логин нельзя изменить после создания
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ivanov@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Статус пользователя</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.is_active ? 'Аккаунт активен' : 'Аккаунт заблокирован'}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="Shield" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Роль *</h2>
                </div>
                <div className="space-y-2">
                  <Select
                    value={formData.role_ids[0]?.toString() || ''}
                    onValueChange={(value) => setFormData({ ...formData, role_ids: [parseInt(value)] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.display_name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

          {user?.id && (
            <div className="bg-white rounded-lg border border-[#0ea5e9] p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Link" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Инвайт-ссылка для Telegram</h2>
                </div>
                {loadingInvite ? (
                  <Badge variant="outline">
                    <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                    Загрузка...
                  </Badge>
                ) : existingInvite?.is_used ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Icon name="CheckCircle2" size={12} className="mr-1" />
                    Использована
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500">
                    <Icon name="Clock" size={12} className="mr-1" />
                    Активна
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Отправьте эту ссылку пользователю для подключения к боту
              </p>
              {existingInvite ? (
                <>
                  <div className="flex gap-2">
                    <Input 
                      value={existingInvite.invite_link} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={() => handleCopyInvite(existingInvite.invite_link)}
                  className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 gap-2"
                >
                      <Icon name="Copy" size={18} />
                      Скопировать
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Info" size={14} />
                    <span>Использований: {existingInvite.current_uses}/{existingInvite.max_uses}</span>
                  </div>
                  {existingInvite.is_used && (
                <Button 
                  onClick={handleRegenerateInvite}
                  disabled={regeneratingInvite}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {regeneratingInvite ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Icon name="RefreshCw" size={16} />
                      Сгенерировать новую ссылку
                    </>
                    )}
                  </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">Инвайт-ссылка ещё не создана</p>
                  <Button 
                    onClick={handleRegenerateInvite}
                    disabled={regeneratingInvite}
                    className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 gap-2"
                  >
                    {regeneratingInvite ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Icon name="Plus" size={16} />
                        Создать инвайт-ссылку
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {showInviteSection && inviteLink && (
            <div className="bg-white rounded-lg border border-[#0ea5e9] p-4 lg:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="Link" size={20} className="text-[#0ea5e9]" />
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Инвайт-ссылка для Telegram</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Отправьте эту ссылку пользователю для подключения к боту
              </p>
              <div className="flex gap-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={() => handleCopyInvite(inviteLink)}
                  className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 gap-2"
                >
                  <Icon name="Copy" size={18} />
                  Скопировать
                </Button>
              </div>
              <Button 
                onClick={onBack} 
                className="w-full"
                variant="outline"
              >
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelDialog(false);
                onBack();
              }}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="LogOut" size={16} />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}