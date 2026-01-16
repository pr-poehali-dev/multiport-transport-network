import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminConfigCardProps {
  adminTelegramId: string;
  setAdminTelegramId: (value: string) => void;
  adminVerified: boolean;
  isCheckingAdmin: boolean;
  isConnected: boolean;
  isEditMode: boolean;
  onVerify: () => void;
}

export default function AdminConfigCard({
  adminTelegramId,
  setAdminTelegramId,
  adminVerified,
  isCheckingAdmin,
  isConnected,
  isEditMode,
  onVerify
}: AdminConfigCardProps) {
  return (
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
          onClick={onVerify}
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
  );
}
