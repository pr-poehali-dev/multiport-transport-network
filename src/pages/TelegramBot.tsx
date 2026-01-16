import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface LinkedUser {
  user_id: number;
  telegram_id: number;
  telegram_username: string;
  telegram_first_name: string;
  email: string;
  user_name: string;
  created_at: string;
}

interface TelegramConfig {
  bot_token: string;
  bot_username: string;
  admin_telegram_id: number | null;
  is_connected: boolean;
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
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
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
    loadLinkedUsers();
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

  const loadLinkedUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=linked');
      const data = await response.json();
      if (data.linked_users) {
        setLinkedUsers(data.linked_users);
      }
    } catch (error) {
      console.error('Ошибка загрузки привязанных пользователей:', error);
    }
  };

  const handleUnlinkUser = async (userId: number) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&action=unlink&user_id=${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setLinkedUsers(prev => prev.filter(u => u.user_id !== userId));
        toast({
          title: 'Успешно',
          description: 'Пользователь отвязан от Telegram'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось отвязать пользователя'
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

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Send" size={20} className="text-[#0ea5e9]" />
                Подключение бота
                {isConnected && (
                  <Badge variant="default" className="bg-green-500">
                    <Icon name="CheckCircle2" size={12} className="mr-1" />
                    Подключено
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Укажите токен Telegram бота для отправки уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  disabled={!isEditMode}
                />
                <p className="text-xs text-muted-foreground">
                  Получите токен у @BotFather в Telegram
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="botUsername">Username бота</Label>
                <Input
                  id="botUsername"
                  placeholder="your_bot"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  disabled={!isEditMode}
                />
              </div>
              <Button 
                onClick={handleConnectBot}
                disabled={isConnected || isConnecting || !isEditMode}
                className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
              >
                {isConnecting ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : isConnected ? (
                  <>
                    <Icon name="CheckCircle2" size={18} className="mr-2" />
                    Подключено
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить и проверить
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserCog" size={20} className="text-[#0ea5e9]" />
                Главный администратор
                {adminVerified && (
                  <Badge variant="default" className="bg-green-500">
                    <Icon name="CheckCircle2" size={12} className="mr-1" />
                    Подтверждён
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Укажите Telegram ID главного администратора, который будет получать все уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminId">Admin Telegram ID</Label>
                <Input
                  id="adminId"
                  type="number"
                  placeholder="123456789"
                  value={adminTelegramId}
                  onChange={(e) => setAdminTelegramId(e.target.value)}
                  disabled={!isEditMode}
                />
                <p className="text-xs text-muted-foreground">
                  {!isConnected ? 'Сначала подключите бота' : 'Чтобы узнать свой ID, напишите боту @userinfobot'}
                </p>
              </div>
              <Button 
                onClick={handleVerifyAdmin}
                disabled={adminVerified || isCheckingAdmin || !isConnected || !isEditMode}
                className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
              >
                {isCheckingAdmin ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : adminVerified ? (
                  <>
                    <Icon name="CheckCircle2" size={18} className="mr-2" />
                    Подтверждён
                  </>
                ) : (
                  <>
                    <Icon name="UserCheck" size={18} className="mr-2" />
                    Проверить администратора
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="Bell" size={20} className="text-[#0ea5e9]" />
              События и уведомления
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-[#0ea5e9]" />
              </div>
            ) : (
              <div className="grid gap-4">
                {settings.map((setting) => (
                  <Card key={setting.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {EVENT_LABELS[setting.event_type] || setting.event_type}
                            {setting.is_enabled ? (
                              <Badge variant="default" className="bg-green-500">Активно</Badge>
                            ) : (
                              <Badge variant="outline">Отключено</Badge>
                            )}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => handleToggleSetting(setting.event_type, checked)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Текст уведомления</Label>
                        <Textarea
                          value={setting.notification_text}
                          onChange={(e) => {
                            setSettings(prev => prev.map(s => 
                              s.event_type === setting.event_type ? { ...s, notification_text: e.target.value } : s
                            ));
                          }}
                          onBlur={(e) => handleUpdateNotificationText(setting.event_type, e.target.value)}
                          rows={2}
                          placeholder="Текст уведомления"
                        />
                        <p className="text-xs text-muted-foreground">
                          Используйте переменные: {'{order_id}'}, {'{driver_name}'}, {'{status}'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground">Кому отправлять</Label>
                          {editingRoles === setting.event_type ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingRoles(null)}
                              >
                                <Icon name="X" size={14} className="mr-1" />
                                Отмена
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleSaveRoles(setting.event_type)}
                                className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                              >
                                <Icon name="Check" size={14} className="mr-1" />
                                Сохранить
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditRoles(setting.event_type, setting.role_ids)}
                            >
                              <Icon name="Edit" size={14} className="mr-1" />
                              Изменить
                            </Button>
                          )}
                        </div>
                        
                        {editingRoles === setting.event_type ? (
                          <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
                            {roles.map((role) => (
                              <Badge 
                                key={role.id}
                                variant={tempRoleIds.includes(role.id) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleRole(role.id)}
                              >
                                <Icon name="Shield" size={12} className="mr-1" />
                                {role.display_name}
                                {tempRoleIds.includes(role.id) && (
                                  <Icon name="Check" size={12} className="ml-1" />
                                )}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {setting.role_ids && setting.role_ids.length > 0 ? (
                              setting.role_ids.map((roleId) => {
                                const role = roles.find(r => r.id === roleId);
                                return role ? (
                                  <Badge key={roleId} variant="secondary">
                                    <Icon name="Shield" size={12} className="mr-1" />
                                    {role.display_name}
                                  </Badge>
                                ) : null;
                              })
                            ) : (
                              <p className="text-xs text-muted-foreground">Роли не выбраны</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} className="text-[#0ea5e9]" />
                Привязанные пользователи
              </CardTitle>
              <CardDescription>
                Пользователи, которые подключились к боту через инвайт-ссылку
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="UserX" size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет привязанных пользователей</p>
                  <p className="text-sm mt-1">Создайте инвайт-ссылку в разделе "Пользователи"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedUsers.map((user) => (
                    <div 
                      key={user.user_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} className="text-muted-foreground" />
                          <span className="font-medium">{user.telegram_first_name || user.user_name}</span>
                          {user.telegram_username && (
                            <span className="text-sm text-muted-foreground">@{user.telegram_username}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Icon name="Mail" size={14} />
                          {user.email}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnlinkUser(user.user_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Unlink" size={16} className="mr-1" />
                        Отвязать
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="Info" size={20} className="text-blue-600" />
                Как это работает
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Создайте бота через @BotFather и получите токен</p>
              <p>2. Укажите токен и username, нажмите "Сохранить и проверить"</p>
              <p>3. Укажите Telegram ID главного администратора и проверьте его</p>
              <p>4. Пользователи должны получить инвайт-ссылку (создаётся в разделе "Пользователи")</p>
              <p>5. После подключения через инвайт-ссылку они начнут получать уведомления согласно своей роли</p>
            </CardContent>
          </Card>
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
              Все несохранённые изменения будут потеряны. Вы уверены, что хотите выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelEdit}
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