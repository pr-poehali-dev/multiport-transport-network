import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';

interface DashboardViewProps {
  onMenuClick: () => void;
  onRefresh: () => void;
  setActiveSection: (section: string) => void;
  setReferencesOpen: (open: boolean) => void;
  setDocumentsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setShowAddOrders: (show: boolean) => void;
  setShowAddDriver: (show: boolean) => void;
  setShowAddVehicle: (show: boolean) => void;
  setShowAddContractor: (show: boolean) => void;
}

export default function DashboardView({
  onMenuClick,
  onRefresh,
  setActiveSection,
  setReferencesOpen,
  setDocumentsOpen,
  setSettingsOpen,
  setShowAddOrders,
  setShowAddDriver,
  setShowAddVehicle,
  setShowAddContractor
}: DashboardViewProps) {
  return (
    <main className="flex-1 flex flex-col">
      <TopBar
        title="Дашборд"
        onMenuClick={onMenuClick}
        onRefresh={onRefresh}
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
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
                  className="cursor-pointer hover:shadow-lg transition-shadow border-border hover:border-[#0ea5e9] relative group"
                  onClick={() => {
                    setActiveSection(item.id);
                    setReferencesOpen(true);
                    setDocumentsOpen(false);
                    setSettingsOpen(false);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-[#0ea5e9]/10 rounded-lg p-2">
                        <Icon name={item.icon as any} size={24} className="text-[#0ea5e9]" />
                      </div>
                      {(item.id === 'orders' || item.id === 'drivers' || item.id === 'vehicles' || item.id === 'contractors') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.id === 'orders') {
                              setShowAddOrders(true);
                            } else if (item.id === 'drivers') {
                              setShowAddDriver(true);
                            } else if (item.id === 'vehicles') {
                              setShowAddVehicle(true);
                            } else if (item.id === 'contractors') {
                              setShowAddContractor(true);
                            }
                          }}
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
  );
}
