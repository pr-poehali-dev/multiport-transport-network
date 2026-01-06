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
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadRoles();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram');
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

  const handleToggleSetting = async (eventType: string, isEnabled: boolean) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&event_type=${eventType}`,
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
        `https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a?resource=telegram&event_type=${eventType}`,
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

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Telegram Бот"
        onMenuClick={onMenuClick}
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
                />
              </div>
              <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить настройки
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

                      {setting.role_ids && setting.role_ids.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Кому отправлять</Label>
                          <div className="flex flex-wrap gap-2">
                            {setting.role_ids.map((roleId) => {
                              const role = roles.find(r => r.id === roleId);
                              return role ? (
                                <Badge key={roleId} variant="secondary">
                                  <Icon name="Shield" size={12} className="mr-1" />
                                  {role.display_name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="border-border bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="Info" size={20} className="text-blue-600" />
                Как это работает
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Создайте бота через @BotFather и получите токен</p>
              <p>2. Укажите токен в настройках выше</p>
              <p>3. Пользователи должны получить инвайт-ссылку (создаётся в разделе "Пользователи")</p>
              <p>4. После подключения через инвайт-ссылку они начнут получать уведомления согласно своей роли</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
