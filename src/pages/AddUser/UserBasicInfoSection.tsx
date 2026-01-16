import { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface RoleOption {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface UserBasicInfoSectionProps {
  fullName: string;
  setFullName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  isEditMode: boolean;
  roles: RoleOption[];
  roleIds: number[];
  setRoleIds: (ids: number[]) => void;
  searchRole: string;
  setSearchRole: (value: string) => void;
  showRoleList: boolean;
  setShowRoleList: (show: boolean) => void;
  onFullNameChange: (value: string) => void;
}

export default function UserBasicInfoSection({
  fullName,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  isActive,
  setIsActive,
  isEditMode,
  roles,
  roleIds,
  setRoleIds,
  searchRole,
  setSearchRole,
  showRoleList,
  setShowRoleList,
  onFullNameChange
}: UserBasicInfoSectionProps) {
  const roleSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (roleSectionRef.current && !roleSectionRef.current.contains(target)) {
        setShowRoleList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowRoleList]);

  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">ФИО *</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ivanov_ii"
              disabled={isEditMode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль {!isEditMode && '*'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditMode ? "Оставьте пустым, чтобы не менять" : "••••••••"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivanov@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div ref={roleSectionRef} className="space-y-2 relative">
            <Label htmlFor="role">Роль</Label>
            <div className="relative">
              <Input
                id="role"
                placeholder="Начните вводить название роли..."
                value={searchRole}
                onChange={(e) => {
                  setSearchRole(e.target.value);
                  setShowRoleList(true);
                }}
                onFocus={() => setShowRoleList(true)}
              />
              
              {showRoleList && roles.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {roles
                    .filter(r => r.display_name.toLowerCase().includes(searchRole.toLowerCase()) || 
                                r.name.toLowerCase().includes(searchRole.toLowerCase()))
                    .map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setRoleIds([role.id]);
                          setSearchRole(role.display_name);
                          setShowRoleList(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-border last:border-0"
                      >
                        <Icon name="Shield" size={18} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{role.display_name}</p>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between h-10 px-3 border border-border rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal mb-0">Статус</Label>
              <span className="text-xs text-muted-foreground">
                {isActive ? 'Активен' : 'Заблокирован'}
              </span>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
