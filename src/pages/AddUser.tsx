import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';

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
    <div className="flex-1 flex flex-col">
      <TopBar
        title={user ? 'Редактировать пользователя' : 'Добавить пользователя'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="hover:bg-[#0ea5e9]/10"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Инвайт-ссылка (если только что создали пользователя) */}
          {showInviteSection && inviteLink && (
            <Card className="border-[#0ea5e9]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon name="Link" size={24} className="text-[#0ea5e9]" />
                  <CardTitle>Инвайт-ссылка для Telegram</CardTitle>
                </div>
                <CardDescription>
                  Отправьте эту ссылку пользователю для подключения к боту
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={inviteLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={handleCopyInvite}
                    className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                  >
                    <Icon name="Copy" size={18} className="mr-2" />
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
              </CardContent>
            </Card>
          )}

          {/* Основная форма */}
          {!showInviteSection && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                  <CardDescription>
                    ФИО пользователя и данные для входа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">ФИО *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div>
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

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ivanov@example.com"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_active: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Активен
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Роли</CardTitle>
                  <CardDescription>
                    Назначьте роли для определения прав доступа
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={onBack} 
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={18} className="mr-2" />
                      {user ? 'Сохранить изменения' : 'Создать пользователя'}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
