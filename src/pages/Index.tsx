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
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

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
      <aside className="w-64 bg-[#1a1a1a] text-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 bg-[#0ea5e9] rounded-lg p-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Icon name="Truck" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm leading-tight">TransHub</h1>
              <p className="text-white/70 text-xs truncate">Управление грузоперевозка...</p>
            </div>
          </div>

          <div className="mb-6 px-2">
            <div className="flex items-center gap-2 text-white/90">
              <Icon name="User" size={18} />
              <span className="text-sm font-medium">Администратор</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'dashboard'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="LayoutGrid" size={20} />
                <span className="text-sm font-medium">Дашборд</span>
              </div>
            </button>

            <div>
              <button
                onClick={() => setReferencesOpen(!referencesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Book" size={20} />
                  <span className="text-sm font-medium">Справочники</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${referencesOpen ? 'rotate-90' : ''}`} />
              </button>
              {referencesOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  {[
                    { id: 'orders', label: 'Заказы' },
                    { id: 'drivers', label: 'Водители' },
                    { id: 'vehicles', label: 'Автомобили' },
                    { id: 'contractors', label: 'Контрагенты' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveSection(subItem.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setDocumentsOpen(!documentsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="FileText" size={20} />
                  <span className="text-sm font-medium">Документы</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${documentsOpen ? 'rotate-90' : ''}`} />
              </button>
              {documentsOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  {[
                    { id: 'contract', label: 'Договор-Заявка' },
                    { id: 'ttn', label: 'ТТН' },
                    { id: 'upd', label: 'УПД' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveSection(subItem.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'overview'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="Activity" size={20} />
                <span className="text-sm font-medium">Обзор</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'settings'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="Settings" size={20} />
                <span className="text-sm font-medium">Настройки</span>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/60" />
            </button>
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