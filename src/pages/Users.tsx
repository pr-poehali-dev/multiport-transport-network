import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddUser from './AddUser';
import { useToast } from '@/hooks/use-toast';
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
  created_at: string;
  invite?: {
    id: number;
    code: string;
    invite_link: string;
    is_used: boolean;
    current_uses: number;
    max_uses: number;
  } | null;
}

interface UsersProps {
  onMenuClick: () => void;
}

function Users({ onMenuClick }: UsersProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [loadingInvites, setLoadingInvites] = useState<Record<number, boolean>>({});

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users');
      const data = await response.json();
      if (data.users) {
        const usersWithInvites = await Promise.all(
          data.users.map(async (user: User) => {
            try {
              const inviteResponse = await fetch(
                `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites&action=user_invite&user_id=${user.id}`
              );
              const inviteData = await inviteResponse.json();
              return { ...user, invite: inviteData.invite };
            } catch {
              return { ...user, invite: null };
            }
          })
        );
        setUsers(usersWithInvites);
        setFilteredUsers(usersWithInvites);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = user.full_name.toLowerCase();
      const username = user.username.toLowerCase();
      const email = user.email.toLowerCase();
      
      return fullName.includes(query) || 
             username.includes(query) || 
             email.includes(query);
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleRefresh = () => {
    loadUsers();
    toast({
      title: 'Обновлено',
      description: 'Список пользователей обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setUserToEdit(null);
    loadUsers();
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsAdding(true);
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleRegenerateInvite = async (userId: number) => {
    setLoadingInvites(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=invites&action=regenerate&user_id=${userId}`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Инвайт обновлён',
          description: 'Новая инвайт-ссылка сгенерирована'
        });
        
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, invite: data } : u
        ));
        setFilteredUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, invite: data } : u
        ));
      } else {
        throw new Error(data.error || 'Ошибка генерации инвайта');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить инвайт'
      });
    } finally {
      setLoadingInvites(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCopyInvite = (inviteLink: string) => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Скопировано',
      description: 'Инвайт-ссылка скопирована в буфер обмена'
    });
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=users&id=${userToDelete}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Пользователь удалён',
          description: data.message || 'Пользователь успешно удалён из системы',
        });
        
        setDeleteDialogOpen(false);
        setUserToDelete(null);
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

  if (isAdding) {
    return <AddUser user={userToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Пользователи"
        onMenuClick={onMenuClick}
        onRefresh={handleRefresh}
        rightButtons={
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
          >
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Поиск по имени, логину, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Найдено пользователей: <span className="font-semibold text-foreground">{filteredUsers.length}</span>
            </p>
          )}
        </div>

        {/* Список пользователей */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
            <p>{searchQuery ? 'Ничего не найдено' : 'Нажмите "+ Добавить" для создания'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-white rounded-lg border border-border hover:border-[#0ea5e9] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded">
                    <Icon name="UserCircle" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{user.full_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">@{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.roles.map((role) => (
                          <Badge
                            key={role.role_id}
                            variant="secondary"
                            className="text-xs bg-[#0ea5e9]/10 text-[#0ea5e9] px-2 py-0.5"
                          >
                            {role.role_display_name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </p>
                    
                    {/* Инвайт-ссылка */}
                    {user.invite && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Link" size={14} className="text-[#0ea5e9]" />
                          <span className="text-xs font-medium">Инвайт-ссылка</span>
                          {user.invite.is_used ? (
                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                              Использован
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                              Активен
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            onClick={() => handleCopyInvite(user.invite!.invite_link)}
                          >
                            <Icon name="Copy" size={12} className="mr-1" />
                            Скопировать
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRegenerateInvite(user.id)}
                            disabled={loadingInvites[user.id]}
                          >
                            {loadingInvites[user.id] ? (
                              <Icon name="Loader2" size={12} className="animate-spin" />
                            ) : (
                              <Icon name="RefreshCw" size={12} />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                      onClick={() => handleEditUser(user)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Пользователь будет удалён из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Users;