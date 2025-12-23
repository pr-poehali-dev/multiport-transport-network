import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import Drivers from './Drivers';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleRefreshDashboard = () => {
    console.log('Обновление дашборда...');
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#1a1a1a] text-white flex flex-col flex-shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
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
              onClick={() => {
                setActiveSection('dashboard');
                setReferencesOpen(false);
                setDocumentsOpen(false);
                setSettingsOpen(false);
                setSidebarOpen(false);
              }}
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
                    { id: 'orders', label: 'Заказы', icon: 'Package' },
                    { id: 'drivers', label: 'Водители', icon: 'UserCircle' },
                    { id: 'vehicles', label: 'Автомобили', icon: 'Truck' },
                    { id: 'contractors', label: 'Контрагенты', icon: 'Building2' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection(subItem.id);
                        setReferencesOpen(true);
                        setDocumentsOpen(false);
                        setSettingsOpen(false);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-[#0ea5e9] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      <Icon name={subItem.icon as any} size={16} />
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
                    { id: 'contract', label: 'Договор-Заявка', icon: 'FileSignature' },
                    { id: 'ttn', label: 'ТТН', icon: 'ClipboardList' },
                    { id: 'upd', label: 'УПД', icon: 'Receipt' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection(subItem.id);
                        setDocumentsOpen(true);
                        setReferencesOpen(false);
                        setSettingsOpen(false);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-[#0ea5e9] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      <Icon name={subItem.icon as any} size={16} />
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveSection('overview');
                setReferencesOpen(false);
                setDocumentsOpen(false);
                setSettingsOpen(false);
                setSidebarOpen(false);
              }}
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

            <div>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Settings" size={20} />
                  <span className="text-sm font-medium">Настройки</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  <button
                    onClick={() => {
                      setActiveSection('templates');
                      setSettingsOpen(true);
                      setReferencesOpen(false);
                      setDocumentsOpen(false);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === 'templates'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <Icon name="Layers" size={16} />
                    Шаблоны
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {activeSection === 'drivers' ? (
        <Drivers onMenuClick={() => setSidebarOpen(true)} />
      ) : (
        <main className="flex-1 flex flex-col">
          <TopBar
            title="Дашборд"
            onMenuClick={() => setSidebarOpen(true)}
            onRefresh={handleRefreshDashboard}
          />

          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Справочники */}
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="Book" size={24} className="text-[#0ea5e9]" />
                  Справочники
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'orders', label: 'Заказы', icon: 'Package', description: 'Управление заказами' },
                    { id: 'drivers', label: 'Водители', icon: 'UserCircle', description: 'База водителей' },
                    { id: 'vehicles', label: 'Автомобили', icon: 'Truck', description: 'Парк автомобилей' },
                    { id: 'contractors', label: 'Контрагенты', icon: 'Building2', description: 'Клиенты и партнёры' },
                  ].map((item) => (
                    <Card 
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-border hover:border-[#0ea5e9]"
                      onClick={() => {
                        setActiveSection(item.id);
                        setReferencesOpen(true);
                        setDocumentsOpen(false);
                        setSettingsOpen(false);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-[#0ea5e9]/10 rounded-lg p-2">
                            <Icon name={item.icon as any} size={24} className="text-[#0ea5e9]" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Документы */}
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="FileText" size={24} className="text-[#0ea5e9]" />
                  Документы
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'contract', label: 'Договор-Заявка', icon: 'FileSignature', description: 'Договора с клиентами' },
                    { id: 'ttn', label: 'ТТН', icon: 'ClipboardList', description: 'Товарно-транспортные накладные' },
                    { id: 'upd', label: 'УПД', icon: 'Receipt', description: 'Универсальные передаточные документы' },
                  ].map((item) => (
                    <Card 
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-border hover:border-[#0ea5e9]"
                      onClick={() => {
                        setActiveSection(item.id);
                        setDocumentsOpen(true);
                        setReferencesOpen(false);
                        setSettingsOpen(false);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-[#0ea5e9]/10 rounded-lg p-2">
                            <Icon name={item.icon as any} size={24} className="text-[#0ea5e9]" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Index;