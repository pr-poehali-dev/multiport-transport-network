import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function InfoCard() {
  return (
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
  );
}
