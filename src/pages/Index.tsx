import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

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

function Index() {
  const [activeSection, setActiveSection] = useState('dashboard');

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
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Icon name="Truck" size={32} className="text-primary" />
            <h1 className="text-xl font-bold">LogisticHub</h1>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
              { id: 'orders', label: 'Заказы', icon: 'Package' },
              { id: 'routes', label: 'Маршруты', icon: 'Map' },
              { id: 'partners', label: 'Партнеры', icon: 'Users' },
              { id: 'documents', label: 'Документы', icon: 'FileText' },
              { id: 'profile', label: 'Профиль', icon: 'User' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  activeSection === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name={item.icon as any} size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Панель управления</h2>
              <p className="text-muted-foreground mt-1">Мониторинг логистических операций</p>
            </div>
            <Button className="gap-2">
              <Icon name="Bell" size={18} />
              Уведомления
              <Badge variant="destructive" className="ml-1">4</Badge>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon name={stat.icon as any} size={20} className="text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {stat.trend} за неделю
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Package" size={20} />
                  Активные заказы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="inTransit">В пути</TabsTrigger>
                    <TabsTrigger value="delivered">Доставлено</TabsTrigger>
                    <TabsTrigger value="delayed">Задержка</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4 mt-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-lg">{order.id}</span>
                              <Badge className={getStatusColor(order.status)} variant="outline">
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {order.route}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Icon name="ExternalLink" size={16} />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Перевозчик:</span>
                            <span className="font-medium">{order.carrier}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Прогресс:</span>
                              <span className="font-medium">{order.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">ETA:</span>
                            <span className="font-medium">{order.eta}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={20} />
                  Центр уведомлений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <Icon
                              name={getNotificationIcon(notification.type)}
                              size={20}
                              className={
                                notification.type === 'success' ? 'text-green-600' :
                                notification.type === 'warning' ? 'text-yellow-600' :
                                notification.type === 'alert' ? 'text-red-600' :
                                'text-blue-600'
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Index;
