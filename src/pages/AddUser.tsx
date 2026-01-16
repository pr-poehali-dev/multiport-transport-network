import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    is_active: user?.is_active ?? true,
    role_ids: user?.roles?.map(r => r.role_id) || [] as number[]
  });

  useEffect(() => {
    loadRoles();
  }, []);

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
    if (!formData.full_name.trim() || !formData.username.trim() || !formData.email.trim()) {
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

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Скопировано',
      description: 'Инвайт-ссылка скопирована в буфер обмена'
    });
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId]
    }));
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
          !showInviteSection && (
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
          )
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          
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
                  onClick={handleCopyInvite}
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

          {!showInviteSection && (
            <>
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
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Роли и права доступа</h2>
                </div>
                <div className="space-y-3">
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-[#0ea5e9] transition-colors"
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.role_ids.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {role.display_name}
                          </label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.role_ids.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Выбранные роли:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.role_ids.map(roleId => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Badge 
                              key={roleId}
                              variant="outline"
                              className="bg-[#0ea5e9]/5 border-[#0ea5e9]/20"
                            >
                              {role.display_name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
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