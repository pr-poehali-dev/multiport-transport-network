import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';

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
  created_at: string;
}

interface RoleOption {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface UsersProps {
  onMenuClick: () => void;
}

export default function Users({ onMenuClick }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    is_active: true,
    role_ids: [] as number[]
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateUser = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      is_active: true,
      role_ids: []
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      is_active: user.is_active,
      role_ids: user.roles ? user.roles.map(r => r.role_id) : []
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните все обязательные поля'
      });
      return;
    }

    try {
      const url = isEditMode && selectedUser
        ? `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users&id=${selectedUser.id}`
        : 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: isEditMode ? 'Пользователь обновлён' : 'Пользователь создан'
        });
        setIsDialogOpen(false);
        loadUsers();
      } else {
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить пользователя'
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Удалить пользователя "${user.full_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users&id=${user.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Пользователь удалён'
        });
        loadUsers();
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить пользователя'
      });
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId]
    }));
  };

  const handleGenerateInvite = async (userId: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (response.ok && data.invite_link) {
        setInviteLink(data.invite_link);
        setShowInviteDialog(true);
      } else {
        throw new Error(data.error || 'Ошибка создания инвайт-ссылки');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать инвайт-ссылку'
      });
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Скопировано',
      description: 'Инвайт-ссылка скопирована в буфер обмена'
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Пользователи"
        onMenuClick={onMenuClick}
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Управление пользователями</h2>
              <p className="text-muted-foreground mt-1">Добавляйте пользователей и назначайте им роли</p>
            </div>
            <Button onClick={handleCreateUser} className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить пользователя
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-[#0ea5e9]" />
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="border-border hover:border-[#0ea5e9] transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{user.full_name}</CardTitle>
                          {!user.is_active && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                              <Icon name="XCircle" size={12} className="mr-1" />
                              Неактивен
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={14} className="text-muted-foreground" />
                            <span>{user.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={14} className="text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateInvite(user.id)}
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <Icon name="Link" size={16} className="mr-2" />
                          Инвайт-ссылка
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                        >
                          <Icon name="Pencil" size={16} className="mr-2" />
                          Редактировать
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Роли: <span className="font-medium text-foreground">{user.roles?.length || 0}</span>
                      </div>
                      {user.roles && user.roles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Icon name="Shield" size={12} className="mr-1" />
                              {role.role_display_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
                <DialogDescription>
                  Укажите данные пользователя и назначьте роли
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Логин *</Label>
                    <Input
                      id="username"
                      placeholder="ivanov"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ivanov@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Полное имя *</Label>
                  <Input
                    id="full_name"
                    placeholder="Иванов Иван Иванович"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Активный пользователь
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label>Роли</Label>
                  <div className="grid grid-cols-1 gap-2 border rounded-lg p-3">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.role_ids.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            <Icon name="Shield" size={14} />
                            {role.display_name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveUser} className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
                  {isEditMode ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="Link" size={20} className="text-green-600" />
                  Инвайт-ссылка для Telegram бота
                </DialogTitle>
                <DialogDescription>
                  Отправьте эту ссылку пользователю для подключения к боту
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Ссылка</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleCopyInvite}
                      variant="outline"
                      size="icon"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-blue-900">Как это работает:</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800">
                        <li>Скопируйте ссылку и отправьте её пользователю</li>
                        <li>Пользователь открывает ссылку и запускает бота в Telegram</li>
                        <li>Бот автоматически привязывается к аккаунту пользователя</li>
                        <li>Пользователь начинает получать уведомления согласно своей роли</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setShowInviteDialog(false)} variant="outline">
                  Закрыть
                </Button>
                <Button onClick={handleCopyInvite} className="bg-green-600 hover:bg-green-700">
                  <Icon name="Copy" size={16} className="mr-2" />
                  Скопировать ссылку
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}