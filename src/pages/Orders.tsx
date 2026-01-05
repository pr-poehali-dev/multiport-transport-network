import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddOrders from './AddOrders';
import { getOrders, Order } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';

interface OrdersProps {
  onMenuClick: () => void;
}

function Orders({ onMenuClick }: OrdersProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список заказов'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => {
      const routeNumber = (order.routeNumber || '').toLowerCase();
      const invoice = (order.invoice || '').toLowerCase();
      const fullRoute = (order.fullRoute || '').toLowerCase();
      const consigneeNames = order.consignees.map(c => c.name.toLowerCase()).join(' ');
      
      return routeNumber.includes(query) || 
             invoice.includes(query) || 
             fullRoute.includes(query) ||
             consigneeNames.includes(query);
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const handleRefresh = () => {
    loadOrders();
    toast({
      title: 'Обновлено',
      description: 'Список заказов обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    loadOrders();
  };

  if (isAdding) {
    return <AddOrders onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Заказы"
        onMenuClick={onMenuClick}
        onRefresh={handleRefresh}
        rightButtons={
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
          >
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Поиск по номеру, клиенту, маршруту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Список заказов */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Загрузка заказов...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет заказов'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="FileText" size={18} className="text-[#0ea5e9]" />
                      <span className="font-semibold text-lg">
                        {order.routeNumber || 'Без номера'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                {/* Инфо */}
                <div className="space-y-2 text-sm">
                  {/* Маршрут */}
                  {order.fullRoute && (
                    <div className="flex items-start gap-2">
                      <Icon name="Route" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground line-clamp-2">{order.fullRoute}</p>
                    </div>
                  )}

                  {/* Грузополучатели */}
                  {order.consignees.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground line-clamp-1">
                        {order.consignees.map(c => c.name).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Накладная */}
                  {order.invoice && (
                    <div className="flex items-start gap-2">
                      <Icon name="Receipt" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{order.invoice}</p>
                    </div>
                  )}

                  {/* Вес */}
                  {order.weight && (
                    <div className="flex items-start gap-2">
                      <Icon name="Weight" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{order.weight} кг</p>
                    </div>
                  )}
                </div>

                {/* Футер карточки */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {order.routes.length} {order.routes.length === 1 ? 'маршрут' : 'маршрутов'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Icon name="Eye" size={16} />
                    Открыть
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;