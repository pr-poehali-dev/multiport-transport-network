import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddUser from './AddUser';
import { useToast } from '@/hooks/use-toast';
import { getUsers, deleteUser } from '@/api/users';
import { API_CONFIG, apiRequest } from '@/api/config';
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

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
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

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      if (data.users) {
        const usersWithInvites = await Promise.all(
          data.users.map(async (user: User) => {
            try {
              const inviteData = await apiRequest(
                `${API_CONFIG.ENDPOINTS.invites}&action=user_invite&user_id=${user.id}`
              );
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

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const data = await deleteUser(userToDelete);
      
      toast({
        title: 'Пользователь удалён',
        description: data.message || 'Пользователь успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
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

        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="UserCircle" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет пользователей'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const telegramConnected = user.invite?.is_used || false;
              
              return (
                <div
                  key={user.id}
                  className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0ea5e9]/10 rounded-full">
                      <Icon name="UserCircle" size={24} className="text-[#0ea5e9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {user.full_name}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
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
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Mail" size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{user.email || '—'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon 
                        name="MessageCircle" 
                        size={16} 
                        className={`flex-shrink-0 ${telegramConnected ? 'text-green-600' : 'text-red-600'}`} 
                      />
                      <span className={telegramConnected ? 'text-green-600' : 'text-red-600'}>
                        {telegramConnected ? 'Telegram подключен' : 'Telegram не подключен'}
                      </span>
                    </div>

                    {user.is_admin && (
                      <div className="flex items-center gap-2">
                        <Icon name="Shield" size={16} className="text-[#0ea5e9] flex-shrink-0" />
                        <Badge variant="outline" className="text-xs border-[#0ea5e9] text-[#0ea5e9]">
                          Администратор
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Icon 
                        name={user.is_active ? "CheckCircle2" : "XCircle"} 
                        size={16} 
                        className={`flex-shrink-0 ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}
                      />
                      <span className={user.is_active ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-red-500" />
              Удалить пользователя?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Это действие нельзя отменить. Пользователь будет полностью удалён из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="X" size={16} />
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Users;