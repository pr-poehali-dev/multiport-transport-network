import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';

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
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: RESOURCES.map(r => ({
      resource: r.value,
      resourceLabel: r.label,
      can_create: false,
      can_read: false,
      can_update: false,
      can_remove: false,
    }))
  });

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

  const handleCreateRole = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: RESOURCES.map(r => ({
        resource: r.value,
        resourceLabel: r.label,
        can_create: false,
        can_read: false,
        can_update: false,
        can_remove: false,
      }))
    });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setIsEditMode(true);
    setSelectedRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permissions: RESOURCES.map(r => {
        const existingPerm = role.permissions.find(p => p.resource === r.value);
        return {
          resource: r.value,
          resourceLabel: r.label,
          can_create: existingPerm?.can_create || false,
          can_read: existingPerm?.can_read || false,
          can_update: existingPerm?.can_update || false,
          can_remove: existingPerm?.can_remove || false,
        };
      })
    });
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!formData.display_name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Укажите название роли'
      });
      return;
    }

    try {
      const url = isEditMode && selectedRole
        ? `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles&id=${selectedRole.id}`
        : 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: isEditMode ? 'Роль обновлена' : 'Роль создана'
        });
        setIsDialogOpen(false);
        loadRoles();
      } else {
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить роль'
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Системные роли нельзя удалить'
      });
      return;
    }

    if (!confirm(`Удалить роль "${role.display_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles&id=${role.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Роль удалена'
        });
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

  const togglePermission = (resourceIndex: number, permType: 'can_create' | 'can_read' | 'can_update' | 'can_remove') => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, idx) =>
        idx === resourceIndex ? { ...perm, [permType]: !perm[permType] } : perm
      )
    }));
  };

  const toggleAllPermissions = (resourceIndex: number, enable: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, idx) =>
        idx === resourceIndex ? {
          ...perm,
          can_create: enable,
          can_read: enable,
          can_update: enable,
          can_remove: enable
        } : perm
      )
    }));
  };

  const getPermissionCount = (role: Role) => {
    return role.permissions.reduce((count, perm) => {
      return count + (perm.can_create ? 1 : 0) + (perm.can_read ? 1 : 0) + (perm.can_update ? 1 : 0) + (perm.can_remove ? 1 : 0);
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Роли и права доступа"
        onMenuClick={onMenuClick}
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Управление ролями</h2>
              <p className="text-muted-foreground mt-1">Создавайте роли и настраивайте права доступа</p>
            </div>
            <Button onClick={handleCreateRole} className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
              <Icon name="Plus" size={20} className="mr-2" />
              Создать роль
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-[#0ea5e9]" />
            </div>
          ) : (
            <div className="grid gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="border-border hover:border-[#0ea5e9] transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{role.display_name}</CardTitle>
                          {role.is_system && (
                            <Badge variant="outline" className="text-xs">
                              <Icon name="Lock" size={12} className="mr-1" />
                              Системная
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">{role.description}</CardDescription>
                      </div>
                      {!role.is_system && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            className="hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                          >
                            <Icon name="Pencil" size={16} className="mr-2" />
                            Редактировать
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Права доступа: <span className="font-medium text-foreground">{getPermissionCount(role)} разрешений</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.filter(p => p.can_read || p.can_create || p.can_update || p.can_remove).map((perm, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {RESOURCES.find(r => r.value === perm.resource)?.label || perm.resource}:
                            {perm.can_create && ' создание'}
                            {perm.can_read && ' чтение'}
                            {perm.can_update && ' изменение'}
                            {perm.can_remove && ' удаление'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
                <DialogDescription>
                  Настройте права доступа для новой роли
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Название роли *</Label>
                    <Input
                      id="display_name"
                      placeholder="Логист"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Управляет заказами и маршрутами"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Права доступа</h3>
                  {formData.permissions.map((perm, idx) => (
                    <Card key={idx} className="border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="font-medium">{perm.resourceLabel}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAllPermissions(idx, !perm.can_read)}
                            className="text-xs h-7"
                          >
                            {perm.can_read ? 'Снять все' : 'Выбрать все'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { key: 'can_create', label: 'Создание', icon: 'Plus' },
                            { key: 'can_read', label: 'Чтение', icon: 'Eye' },
                            { key: 'can_update', label: 'Изменение', icon: 'Pencil' },
                            { key: 'can_remove', label: 'Удаление', icon: 'Trash2' },
                          ].map((action) => (
                            <div key={action.key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${perm.resource}-${action.key}`}
                                checked={perm[action.key as keyof Permission] as boolean}
                                onCheckedChange={() => togglePermission(idx, action.key as any)}
                              />
                              <Label
                                htmlFor={`${perm.resource}-${action.key}`}
                                className="text-sm font-normal cursor-pointer flex items-center gap-1"
                              >
                                <Icon name={action.icon as any} size={14} />
                                {action.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveRole} className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
                  {isEditMode ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}