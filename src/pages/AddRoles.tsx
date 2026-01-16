import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import TopBar from '@/components/TopBar';
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

interface AddRolesProps {
  role?: Role;
  onBack: () => void;
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

function AddRoles({ role, onBack, onMenuClick }: AddRolesProps) {
  const { toast } = useToast();
  const isEditMode = !!role;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState(role?.display_name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState<Permission[]>(
    RESOURCES.map(r => {
      const existingPerm = role?.permissions.find(p => p.resource === r.value);
      return {
        resource: r.value,
        resourceLabel: r.label,
        can_create: existingPerm?.can_create || false,
        can_read: existingPerm?.can_read || false,
        can_update: existingPerm?.can_update || false,
        can_remove: existingPerm?.can_remove || false,
      };
    })
  );

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const togglePermission = (
    resourceIndex: number,
    permType: 'can_create' | 'can_read' | 'can_update' | 'can_remove'
  ) => {
    setPermissions(prev =>
      prev.map((perm, idx) =>
        idx === resourceIndex ? { ...perm, [permType]: !perm[permType] } : perm
      )
    );
  };

  const toggleAllPermissions = (resourceIndex: number, enable: boolean) => {
    setPermissions(prev =>
      prev.map((perm, idx) =>
        idx === resourceIndex
          ? {
              ...perm,
              can_create: enable,
              can_read: enable,
              can_update: enable,
              can_remove: enable,
            }
          : perm
      )
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Укажите название роли',
      });
      return;
    }

    setIsSaving(true);

    try {
      const url = isEditMode && role
        ? `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles&id=${role.id}`
        : 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=roles';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          description,
          permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: isEditMode ? 'Роль обновлена' : 'Роль создана',
        });
        onBack();
      } else {
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить роль',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать роль' : 'Добавить роль'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
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
          {/* Основная информация */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                Основная информация
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Название роли *</Label>
                <Input
                  id="displayName"
                  placeholder="Логист"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Управляет заказами и маршрутами"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Права доступа */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Lock" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                Права доступа
              </h2>
            </div>

            <div className="space-y-3">
              {permissions.map((perm, idx) => {
                const allChecked =
                  perm.can_create && perm.can_read && perm.can_update && perm.can_remove;
                const someChecked =
                  perm.can_create || perm.can_read || perm.can_update || perm.can_remove;

                return (
                  <div
                    key={perm.resource}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`all-${perm.resource}`}
                          checked={allChecked}
                          onCheckedChange={(checked) =>
                            toggleAllPermissions(idx, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`all-${perm.resource}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {perm.resourceLabel}
                        </Label>
                      </div>
                      {someChecked && !allChecked && (
                        <span className="text-xs text-muted-foreground">Частично</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-6">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`create-${perm.resource}`}
                          checked={perm.can_create}
                          onCheckedChange={() => togglePermission(idx, 'can_create')}
                        />
                        <Label
                          htmlFor={`create-${perm.resource}`}
                          className="text-sm cursor-pointer"
                        >
                          Создание
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`read-${perm.resource}`}
                          checked={perm.can_read}
                          onCheckedChange={() => togglePermission(idx, 'can_read')}
                        />
                        <Label
                          htmlFor={`read-${perm.resource}`}
                          className="text-sm cursor-pointer"
                        >
                          Чтение
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`update-${perm.resource}`}
                          checked={perm.can_update}
                          onCheckedChange={() => togglePermission(idx, 'can_update')}
                        />
                        <Label
                          htmlFor={`update-${perm.resource}`}
                          className="text-sm cursor-pointer"
                        >
                          Изменение
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`remove-${perm.resource}`}
                          checked={perm.can_remove}
                          onCheckedChange={() => togglePermission(idx, 'can_remove')}
                        />
                        <Label
                          htmlFor={`remove-${perm.resource}`}
                          className="text-sm cursor-pointer"
                        >
                          Удаление
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
              Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите
              выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700 gap-2">
              <Icon name="LogOut" size={16} />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddRoles;
