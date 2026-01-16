import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
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
import BotConnectionCard from './TelegramBot/BotConnectionCard';
import AdminConfigCard from './TelegramBot/AdminConfigCard';
import EventNotificationsSection from './TelegramBot/EventNotificationsSection';
import InfoCard from './TelegramBot/InfoCard';

interface TelegramSetting {
  id: number;
  event_type: string;
  notification_text: string;
  is_enabled: boolean;
  role_ids: number[];
}

interface Role {
  id: number;
  display_name: string;
}

interface TelegramBotProps {
  onMenuClick: () => void;
}

const EVENT_LABELS: Record<string, string> = {
  order_created: '📦 Создан новый заказ',
  order_assigned: '🚚 Заказ назначен на маршрут',
  order_completed: '✅ Заказ завершён',
  contract_created: '📝 Создан договор-заявка',
  driver_assigned: '👤 Назначен водитель',
  delay_detected: '⚠️ Обнаружена задержка'
};

export default function TelegramBot({ onMenuClick }: TelegramBotProps) {
  const [settings, setSettings] = useState<TelegramSetting[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [editingRoles, setEditingRoles] = useState<string | null>(null);
  const [tempRoleIds, setTempRoleIds] = useState<number[]>([]);
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [adminTelegramId, setAdminTelegramId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [originalData, setOriginalData] = useState({ 
    botToken: '', 
    botUsername: '', 
    adminTelegramId: '',
    isConnected: false,
    adminVerified: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    loadSettings();
    loadRoles();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=config');
      const data = await response.json();
      if (data.config) {
        const token = data.config.bot_token || '';
        const username = data.config.bot_username || '';
        const adminId = data.config.admin_telegram_id?.toString() || '';
        
        setBotToken(token);
        setBotUsername(username);
        setAdminTelegramId(adminId);
        const connected = data.config.is_connected || false;
        const verified = !!data.config.admin_telegram_id;
        
        setIsConnected(connected);
        setAdminVerified(verified);
        
        setOriginalData({ 
          botToken: token, 
          botUsername: username, 
          adminTelegramId: adminId,
          isConnected: connected,
          adminVerified: verified
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки конфига:', error);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки'
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

  const handleConnectBot = async () => {
    if (!botToken.trim() || !botUsername.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните токен и username бота'
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: botToken,
          bot_username: botUsername
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsConnected(true);
        toast({
          title: 'Успешно!',
          description: data.message || 'Бот успешно подключён'
        });
      } else {
        throw new Error(data.error || 'Ошибка подключения');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка подключения',
        description: error instanceof Error ? error.message : 'Не удалось подключить бота'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setIsConnected(false);
    setAdminVerified(false);
  };

  const handleCancelEdit = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelEdit = () => {
    setBotToken(originalData.botToken);
    setBotUsername(originalData.botUsername);
    setAdminTelegramId(originalData.adminTelegramId);
    setIsConnected(originalData.isConnected);
    setAdminVerified(originalData.adminVerified);
    setIsEditMode(false);
    setShowCancelDialog(false);
  };

  const handleSave = async () => {
    setIsEditMode(false);
    setOriginalData({ 
      botToken, 
      botUsername, 
      adminTelegramId,
      isConnected,
      adminVerified
    });
    toast({
      title: 'Сохранено',
      description: 'Изменения успешно сохранены'
    });
  };

  const handleVerifyAdmin = async () => {
    if (!adminTelegramId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Укажите Telegram ID администратора'
      });
      return;
    }

    if (!isConnected) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сначала подключите бота'
      });
      return;
    }

    setIsCheckingAdmin(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_telegram_id: parseInt(adminTelegramId)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAdminVerified(true);
        toast({
          title: 'Успешно!',
          description: `Администратор ${data.user_info?.first_name || ''} подтверждён`
        });
      } else {
        throw new Error(data.error || 'Ошибка проверки');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка проверки',
        description: error instanceof Error ? error.message : 'Не удалось проверить администратора'
      });
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const handleToggleSetting = async (eventType: string, isEnabled: boolean) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=settings&event_type=${eventType}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_enabled: isEnabled })
        }
      );

      if (response.ok) {
        setSettings(prev => prev.map(s => 
          s.event_type === eventType ? { ...s, is_enabled: isEnabled } : s
        ));
        toast({
          title: 'Успешно',
          description: isEnabled ? 'Уведомления включены' : 'Уведомления отключены'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить настройку'
      });
    }
  };

  const handleUpdateNotificationText = async (eventType: string, text: string) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=settings&event_type=${eventType}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_text: text })
        }
      );

      if (response.ok) {
        setSettings(prev => prev.map(s => 
          s.event_type === eventType ? { ...s, notification_text: text } : s
        ));
        toast({
          title: 'Успешно',
          description: 'Текст уведомления обновлён'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить текст'
      });
    }
  };

  const handleEditRoles = (eventType: string, currentRoleIds: number[]) => {
    setEditingRoles(eventType);
    setTempRoleIds(currentRoleIds);
  };

  const handleSaveRoles = async (eventType: string) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=settings&event_type=${eventType}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role_ids: tempRoleIds })
        }
      );

      if (response.ok) {
        setSettings(prev => prev.map(s => 
          s.event_type === eventType ? { ...s, role_ids: tempRoleIds } : s
        ));
        setEditingRoles(null);
        toast({
          title: 'Успешно',
          description: 'Роли обновлены'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить роли'
      });
    }
  };

  const toggleRole = (roleId: number) => {
    setTempRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Telegram Бот"
        onMenuClick={onMenuClick}
        rightButtons={
          isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="gap-2"
              >
                <Icon name="X" size={18} />
                <span className="hidden sm:inline">Отмена</span>
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
              >
                <Icon name="Check" size={18} />
                <span className="hidden sm:inline">Сохранить</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="gap-2"
            >
              <Icon name="Edit" size={18} />
              <span className="hidden sm:inline">Редактировать</span>
            </Button>
          )
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Настройка Telegram бота</h2>
            <p className="text-muted-foreground mt-1">Управляйте уведомлениями для различных событий</p>
          </div>

          <BotConnectionCard
            botToken={botToken}
            setBotToken={setBotToken}
            botUsername={botUsername}
            setBotUsername={setBotUsername}
            isConnected={isConnected}
            isConnecting={isConnecting}
            isEditMode={isEditMode}
            onConnect={handleConnectBot}
          />

          <AdminConfigCard
            adminTelegramId={adminTelegramId}
            setAdminTelegramId={setAdminTelegramId}
            adminVerified={adminVerified}
            isCheckingAdmin={isCheckingAdmin}
            isConnected={isConnected}
            isEditMode={isEditMode}
            onVerify={handleVerifyAdmin}
          />

          <EventNotificationsSection
            settings={settings}
            setSettings={setSettings}
            roles={roles}
            loading={loading}
            editingRoles={editingRoles}
            setEditingRoles={setEditingRoles}
            tempRoleIds={tempRoleIds}
            eventLabels={EVENT_LABELS}
            onToggleSetting={handleToggleSetting}
            onUpdateNotificationText={handleUpdateNotificationText}
            onEditRoles={handleEditRoles}
            onSaveRoles={handleSaveRoles}
            onToggleRole={toggleRole}
          />

          <InfoCard />
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить изменения?</AlertDialogTitle>
            <AlertDialogDescription>
              Все несохраненные изменения будут потеряны
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelEdit}>Да, отменить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
