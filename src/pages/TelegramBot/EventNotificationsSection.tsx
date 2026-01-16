import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

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

interface EventNotificationsSectionProps {
  settings: TelegramSetting[];
  setSettings: (value: TelegramSetting[] | ((prev: TelegramSetting[]) => TelegramSetting[])) => void;
  roles: Role[];
  loading: boolean;
  editingRoles: string | null;
  setEditingRoles: (value: string | null) => void;
  tempRoleIds: number[];
  eventLabels: Record<string, string>;
  onToggleSetting: (eventType: string, isEnabled: boolean) => void;
  onUpdateNotificationText: (eventType: string, text: string) => void;
  onEditRoles: (eventType: string, currentRoleIds: number[]) => void;
  onSaveRoles: (eventType: string) => void;
  onToggleRole: (roleId: number) => void;
}

export default function EventNotificationsSection({
  settings,
  setSettings,
  roles,
  loading,
  editingRoles,
  setEditingRoles,
  tempRoleIds,
  eventLabels,
  onToggleSetting,
  onUpdateNotificationText,
  onEditRoles,
  onSaveRoles,
  onToggleRole
}: EventNotificationsSectionProps) {
  return (
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
                      {eventLabels[setting.event_type] || setting.event_type}
                      {setting.is_enabled ? (
                        <Badge variant="default" className="bg-green-500">Активно</Badge>
                      ) : (
                        <Badge variant="outline">Отключено</Badge>
                      )}
                    </CardTitle>
                  </div>
                  <Switch
                    checked={setting.is_enabled}
                    onCheckedChange={(checked) => onToggleSetting(setting.event_type, checked)}
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
                    onBlur={(e) => onUpdateNotificationText(setting.event_type, e.target.value)}
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
                          onClick={() => onSaveRoles(setting.event_type)}
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
                        onClick={() => onEditRoles(setting.event_type, setting.role_ids)}
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
                          onClick={() => onToggleRole(role.id)}
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
  );
}
