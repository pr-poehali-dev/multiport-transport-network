import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddOrders from './AddOrders';
import { getOrders, deleteOrder, Order } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrdersProps {
  onMenuClick: () => void;
}

function Orders({ onMenuClick }: OrdersProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

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
    setOrderToEdit(null);
    loadOrders();
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsAdding(true);
  };

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const result = await deleteOrder(orderToDelete);
      
      toast({
        title: 'Заказ удалён',
        description: result.message || 'Заказ успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      loadOrders();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить заказ'
      });
    }
  };

  if (isAdding) {
    return <AddOrders order={orderToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
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
                className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
              >
                {/* Заголовок карточки */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded-full flex-shrink-0">
                    <Icon name="FileText" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {order.routeNumber || 'Без номера'}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteClick(order.id!)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
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
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {order.routes.length} {order.routes.length === 1 ? 'маршрут' : 'маршрутов'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы действительно хотите удалить этот заказ? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="X" size={16} />
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Orders;