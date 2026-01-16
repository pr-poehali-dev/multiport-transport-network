import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface BotConnectionCardProps {
  botToken: string;
  setBotToken: (value: string) => void;
  botUsername: string;
  setBotUsername: (value: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  isEditMode: boolean;
  onConnect: () => void;
}

export default function BotConnectionCard({
  botToken,
  setBotToken,
  botUsername,
  setBotUsername,
  isConnected,
  isConnecting,
  isEditMode,
  onConnect
}: BotConnectionCardProps) {
  return (
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
          onClick={onConnect}
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
  );
}
