import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { createUser, updateUser, User } from '@/api/users';
import { API_CONFIG, apiRequest } from '@/api/config';
import UserBasicInfoSection from './AddUser/UserBasicInfoSection';
import UserInviteSection from './AddUser/UserInviteSection';
import CancelConfirmDialog from './AddUser/CancelConfirmDialog';

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
  const [isEditMode, setIsEditMode] = useState(!!user);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [existingInvite, setExistingInvite] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  const [searchRole, setSearchRole] = useState('');
  const [showRoleList, setShowRoleList] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(user?.id || null);
  
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
      const hasInvite = user.id;
      setShowInviteSection(!!hasInvite);
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

  const saveUserData = async () => {
    if (!fullName.trim() || (!isEditMode && !password.trim())) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: ФИО' + (!isEditMode ? ' и Пароль' : '')
      });
      return null;
    }

    try {
      const userData: User = {
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        is_active: isActive,
        role_ids: roleIds
      };
      
      if (password.trim()) {
        userData.password = password.trim();
      }

      const data = isEditMode 
        ? await updateUser(user?.id || createdUserId!, userData)
        : await createUser(userData);

      if (!isEditMode && data.id) {
        setCreatedUserId(data.id);
        setIsEditMode(true);
        loadExistingInvite(data.id);
      }

      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить пользователя'
      });
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const data = await saveUserData();
      
      if (data) {
        toast({
          title: 'Успешно',
          description: data.message || (isEditMode ? 'Пользователь обновлён' : 'Пользователь создан')
        });
        onBack();
      }
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

  const handleSaveAndShowInvite = async () => {
    if (!createdUserId && !user?.id) {
      setIsSaving(true);
      const data = await saveUserData();
      setIsSaving(false);
      
      if (!data || !data.id) {
        return;
      }
      
      toast({
        title: 'Успешно',
        description: 'Пользователь создан'
      });
    }
    
    setShowInviteSection(true);
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
          <UserBasicInfoSection
            fullName={fullName}
            setFullName={setFullName}
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            isActive={isActive}
            setIsActive={setIsActive}
            isEditMode={isEditMode}
            roles={roles}
            roleIds={roleIds}
            setRoleIds={setRoleIds}
            searchRole={searchRole}
            setSearchRole={setSearchRole}
            showRoleList={showRoleList}
            setShowRoleList={setShowRoleList}
            onFullNameChange={handleFullNameChange}
          />

          <UserInviteSection
            showInviteSection={showInviteSection}
            setShowInviteSection={setShowInviteSection}
            existingInvite={existingInvite}
            setExistingInvite={setExistingInvite}
            loadingInvite={loadingInvite}
            regeneratingInvite={regeneratingInvite}
            isSaving={isSaving}
            userId={user?.id || createdUserId}
            onSaveAndShowInvite={handleSaveAndShowInvite}
            onCreateInvite={handleCreateInvite}
            onRegenerateInvite={handleRegenerateInvite}
            onCopyInvite={handleCopyInvite}
          />
        </div>
      </div>

      <CancelConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
