import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { createUser, updateUser, User } from '@/api/users';
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

interface Role {
  role_id: number;
  role_name: string;
  role_display_name: string;
}

interface RoleOption {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface AddUserProps {
  user?: User & { roles?: Role[] };
  onBack: () => void;
  onMenuClick: () => void;
}

export default function AddUser({ user, onBack, onMenuClick }: AddUserProps) {
  const { toast } = useToast();
  const isEditMode = !!user;
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [existingInvite, setExistingInvite] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  const [searchRole, setSearchRole] = useState('');
  const [showRoleList, setShowRoleList] = useState(false);
  const roleSectionRef = useRef<HTMLDivElement>(null);
  const [showInviteSection, setShowInviteSection] = useState(isEditMode);
  const [createdUserId, setCreatedUserId] = useState<number | null>(user?.id || null);
  
  // Основная информация
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [roleIds, setRoleIds] = useState<number[]>(user?.roles?.map(r => r.role_id) || []);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadExistingInvite(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (roleIds.length > 0 && roles.length > 0) {
      const selectedRole = roles.find(r => r.id === roleIds[0]);
      if (selectedRole) {
        setSearchRole(selectedRole.display_name);
      }
    }
  }, [roleIds, roles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (roleSectionRef.current && !roleSectionRef.current.contains(target)) {
        setShowRoleList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRoles = async () => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.roles);
      if (response.roles) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!fullName.trim() || !password.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: ФИО и Пароль'
      });
      return;
    }

    setIsSaving(true);

    try {
      const userData: User = {
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        is_active: isActive,
        role_ids: roleIds
      };

      const data = isEditMode 
        ? await updateUser(user.id!, userData)
        : await createUser(userData);

      toast({
        title: 'Успешно',
        description: data.message || (isEditMode ? 'Пользователь обновлён' : 'Пользователь создан')
      });

      // Если создан новый пользователь, сохраняем его ID и показываем секцию инвайта
      if (!isEditMode && data.id) {
        setCreatedUserId(data.id);
        setShowInviteSection(true);
        loadExistingInvite(data.id);
        return; // Не выходим, чтобы можно было создать инвайт
      }

      onBack();
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
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.invites}&action=user_invite&user_id=${userId}`);
      if (response.invite) {
        setExistingInvite(response.invite);
      } else {
        setExistingInvite(null);
      }
    } catch (error) {
      console.error('Ошибка загрузки инвайта:', error);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCreateInvite = async () => {
    const targetUserId = user?.id || createdUserId;
    if (!targetUserId) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сначала сохраните пользователя'
      });
      return;
    }
    
    setRegeneratingInvite(true);
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.invites, {
        method: 'POST',
        body: JSON.stringify({ user_id: targetUserId })
      });
      
      if (response.invite_link) {
        setExistingInvite(response);
        toast({
          title: 'Инвайт создан',
          description: 'Ссылка готова к отправке'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось создать инвайт'
      });
    } finally {
      setRegeneratingInvite(false);
    }
  };

  const handleRegenerateInvite = async () => {
    const targetUserId = user?.id || createdUserId;
    if (!targetUserId) return;
    
    setRegeneratingInvite(true);
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.invites}&action=regenerate&user_id=${targetUserId}`, {
        method: 'POST'
      });
      
      if (response.invite_link) {
        setExistingInvite(response);
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

  const transliterate = (text: string): string => {
    const map: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return text.toLowerCase().split('').map(char => map[char] || char).join('');
  };

  const generateUsername = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    
    const lastName = parts[0] || '';
    const firstName = parts[1] || '';
    const middleName = parts[2] || '';
    
    const lastNameTranslit = transliterate(lastName);
    const firstInitial = firstName ? transliterate(firstName[0]) : '';
    const middleInitial = middleName ? transliterate(middleName[0]) : '';
    
    return `${lastNameTranslit}_${firstInitial}${middleInitial}`.toLowerCase();
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    
    if (!isEditMode) {
      const generatedUsername = generateUsername(value);
      setUsername(generatedUsername);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать пользователя' : 'Добавить пользователя'}
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
            <Button
              variant="outline"
              onClick={handleCancel}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ФИО *</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
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
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

          {showInviteSection && (
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
                    onClick={handleCreateInvite}
                    disabled={regeneratingInvite || (!user?.id && !createdUserId)}
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
                  {!user?.id && !createdUserId && (
                    <p className="text-xs text-muted-foreground mt-2">Сначала сохраните пользователя</p>
                  )}
                </div>
              )}
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
              onClick={confirmCancel}
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