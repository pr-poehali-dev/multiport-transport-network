import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import AddRoles from './AddRoles';
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

interface Permission {
  resource: string;
  resourceLabel: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_remove: boolean;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
}

interface RolesProps {
  onMenuClick: () => void;
}

const RESOURCES = [
  { value: 'contracts', label: 'Договора' },
  { value: 'contractors', label: 'Контрагенты' },
  { value: 'drivers', label: 'Водители' },
  { value: 'vehicles', label: 'Автомобили' },
  { value: 'roles', label: 'Роли' },
  { value: 'users', label: 'Пользователи' },
];

export default function Roles({ onMenuClick }: RolesProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles');
      const data = await response.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить роли'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRoles();
    toast({
      title: 'Обновлено',
      description: 'Список ролей обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setRoleToEdit(null);
    loadRoles();
  };

  const handleEditRole = (role: Role) => {
    setRoleToEdit(role);
    setIsAdding(true);
  };

  const handleDeleteClick = (role: Role) => {
    if (role.is_system) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Системные роли нельзя удалить'
      });
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles&id=${roleToDelete.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Роль удалена',
          description: data.message || 'Роль успешно удалена из системы'
        });
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        loadRoles();
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить роль'
      });
    }
  };

  const getPermissionCount = (role: Role) => {
    if (!role.permissions || role.permissions.length === 0) {
      return 0;
    }
    return role.permissions.reduce((count, perm) => {
      return count + (perm.can_create ? 1 : 0) + (perm.can_read ? 1 : 0) + (perm.can_update ? 1 : 0) + (perm.can_remove ? 1 : 0);
    }, 0);
  };

  if (isAdding) {
    return <AddRoles role={roleToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Роли и права доступа"
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
        {loading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Shield" size={48} className="mx-auto mb-4 opacity-20" />
            <p>Нажмите "+ Добавить" для создания роли</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 bg-white rounded-lg border border-border hover:border-[#0ea5e9] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded">
                    <Icon name="Shield" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{role.display_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{getPermissionCount(role)} разрешений</p>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                    )}
                    {role.is_system && (
                      <Badge variant="outline" className="text-xs mt-2">
                        <Icon name="Lock" size={12} className="mr-1" />
                        Системная
                      </Badge>
                    )}
                  </div>
                  {!role.is_system && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                        onClick={() => handleEditRole(role)}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteClick(role)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить роль?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Роль будет удалена из системы.
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