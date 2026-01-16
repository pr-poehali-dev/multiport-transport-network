import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';

interface Order {
  id: string;
  route: string;
  status: 'В пути' | 'Доставлено' | 'Ожидание' | 'Задержка';
  carrier: string;
  progress: number;
  eta: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  time: string;
}

interface DashboardContentProps {
  onMenuClick: () => void;
  onRefresh: () => void;
}

export default function DashboardContent({ onMenuClick, onRefresh }: DashboardContentProps) {
  const orders: Order[] = [
    { id: 'ORD-2847', route: 'Москва → Владивосток', status: 'В пути', carrier: 'TransLog Express', progress: 65, eta: '2 дня' },
    { id: 'ORD-2846', route: 'Санкт-Петербург → Казань', status: 'Доставлено', carrier: 'Северная Логистика', progress: 100, eta: 'Завершено' },
    { id: 'ORD-2845', route: 'Новосибирск → Екатеринбург', status: 'В пути', carrier: 'Сибирский Транзит', progress: 40, eta: '4 дня' },
    { id: 'ORD-2844', route: 'Краснодар → Ростов-на-Дону', status: 'Задержка', carrier: 'ЮгТранс', progress: 25, eta: '6 дней' },
  ];

  const notifications: Notification[] = [
    { id: '1', type: 'success', title: 'Заказ доставлен', message: 'ORD-2846 успешно доставлен в Казань', time: '5 мин назад' },
    { id: '2', type: 'warning', title: 'Задержка маршрута', message: 'ORD-2844 задержан на таможне', time: '1 час назад' },
    { id: '3', type: 'info', title: 'Новый партнер', message: 'TransLog Express подтвердил участие', time: '3 часа назад' },
    { id: '4', type: 'alert', title: 'Требуется документ', message: 'ORD-2847 ожидает сертификат качества', time: '5 часов назад' },
  ];

  const stats = [
    { label: 'Активных заказов', value: '124', icon: 'Package', trend: '+12%' },
    { label: 'В пути', value: '87', icon: 'Truck', trend: '+8%' },
    { label: 'Партнеров', value: '45', icon: 'Users', trend: '+3' },
    { label: 'Доставлено за месяц', value: '1,247', icon: 'CheckCircle2', trend: '+18%' },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'В пути': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Доставлено': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Ожидание': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'Задержка': return 'bg-red-500/10 text-red-600 border-red-200';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'CheckCircle2';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      case 'alert': return 'AlertCircle';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Дашборд"
        onMenuClick={onMenuClick}
        onRefresh={onRefresh}
        rightButtons={
          <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Новый заказ</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border hover:border-[#0ea5e9] transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="p-2 bg-[#0ea5e9]/10 rounded-lg">
                  <Icon name={stat.icon as any} size={20} className="text-[#0ea5e9]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Активные заказы</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 text-[#0ea5e9] hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10">
                  Все заказы
                  <Icon name="ArrowRight" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="active">В пути</TabsTrigger>
                  <TabsTrigger value="completed">Доставлено</TabsTrigger>
                  <TabsTrigger value="delayed">Задержки</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border border-border rounded-lg hover:border-[#0ea5e9] transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{order.id}</span>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.carrier}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Icon name="MapPin" size={16} className="text-muted-foreground" />
                        <span className="text-foreground">{order.route}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Прогресс</span>
                          <span className="text-foreground font-medium">{order.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#0ea5e9] h-full rounded-full transition-all"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Осталось</span>
                          <span className="text-foreground font-medium">{order.eta}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="px-6 space-y-4">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-full h-fit ${
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'warning' ? 'bg-yellow-100' :
                          notification.type === 'info' ? 'bg-blue-100' :
                          'bg-red-100'
                        }`}>
                          <Icon
                            name={getNotificationIcon(notification.type) as any}
                            size={16}
                            className={
                              notification.type === 'success' ? 'text-green-600' :
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'info' ? 'text-blue-600' :
                              'text-red-600'
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      {index < notifications.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
