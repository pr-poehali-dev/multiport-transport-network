import { useEffect } from 'react';
import { createOrder, updateOrder, Order } from '@/api/orders';
import { Route, Consignee } from './types';
import { useToast } from '@/hooks/use-toast';
import { Contractor } from '@/api/contractors';
import { Vehicle } from '@/api/vehicles';
import { Driver } from '@/api/drivers';

interface UseOrderHandlersProps {
  isEditMode: boolean;
  order?: Order;
  routes: Route[];
  setRoutes: (routes: Route[]) => void;
  prefix: string;
  orderDate: string;
  setRouteNumber: (number: string) => void;
  consignees: Consignee[];
  setConsignees: (consignees: Consignee[]) => void;
  isOrderLocked: boolean;
  setIsOrderLocked: (locked: boolean) => void;
  setLockedRoutes: (setter: (prev: Set<string>) => Set<string>) => void;
  setShowCancelDialog: (show: boolean) => void;
  setShowConsigneeList: (setter: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  setSearchConsignee: (setter: (prev: Record<string, string>) => Record<string, string>) => void;
  drivers: Driver[];
  setSearchVehicle: (setter: (prev: Record<string, string>) => Record<string, string>) => void;
  setShowVehicleList: (setter: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  onBack: () => void;
}

export function useOrderHandlers({
  isEditMode,
  order,
  routes,
  setRoutes,
  prefix,
  orderDate,
  setRouteNumber,
  consignees,
  setConsignees,
  isOrderLocked,
  setIsOrderLocked,
  setLockedRoutes,
  setShowCancelDialog,
  setShowConsigneeList,
  setSearchConsignee,
  drivers,
  setSearchVehicle,
  setShowVehicleList,
  onBack
}: UseOrderHandlersProps) {
  const { toast } = useToast();

  const getFullRoute = () => {
    return routes
      .filter(r => r.from || r.to)
      .map(r => `${r.from} → ${r.to}`)
      .join(' → ');
  };

  const generateRouteNumber = () => {
    if (!orderDate) return '';
    const date = new Date(orderDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${prefix}-${day}${month}${year}-001`;
  };

  useEffect(() => {
    setRouteNumber(generateRouteNumber());
  }, [prefix, orderDate]);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!isEditMode) {
      if (!isOrderLocked) {
        toast({
          title: 'Ошибка',
          description: 'Сначала нужно сохранить заказ',
          variant: 'destructive'
        });
        return;
      }

      if (routes.length > 0 && routes.some(r => !r.isLocked)) {
        toast({
          title: 'Ошибка',
          description: 'Все маршруты должны быть сохранены',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const orderData = {
        prefix,
        orderDate,
        routeNumber: generateRouteNumber(),
        invoice: '',
        trak: '',
        weight: 0,
        fullRoute: getFullRoute(),
        consignees: consignees.map((c, idx) => ({
          contractorId: c.contractorId,
          name: c.name,
          note: c.note,
          position: idx
        })),
        routes: routes.map((r, idx) => ({
          from: r.from,
          to: r.to,
          vehicleId: r.vehicleId ? parseInt(r.vehicleId) : undefined,
          driverName: r.driverName,
          loadingDate: r.loadingDate || undefined,
          position: idx,
          additionalStops: r.additionalStops.map((s, sIdx) => ({
            type: s.type,
            address: s.address,
            note: s.note,
            position: sIdx
          }))
        }))
      };

      if (isEditMode && order?.id) {
        await updateOrder(order.id, orderData);
        toast({
          title: 'Готово',
          description: 'Заказ успешно обновлён'
        });
      } else {
        await createOrder(orderData);
        toast({
          title: 'Готово',
          description: 'Заказ успешно создан и сохранен в базу данных'
        });
      }
      onBack();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить заказ в базу данных',
        variant: 'destructive'
      });
    }
  };

  const handleSaveOrder = () => {
    setIsOrderLocked(true);
    toast({
      title: 'Заказ сохранен',
      description: 'Теперь можно создавать и блокировать маршруты'
    });
  };

  const handleSaveAndGo = (routeId: string, routeIndex: number) => {
    setRoutes(routes.map(r => 
      r.id === routeId ? { ...r, isLocked: true } : r
    ));
    
    setLockedRoutes(prev => new Set(prev).add(routeId));
    
    toast({
      title: 'Маршрут сохранен',
      description: `Маршрут ${routeIndex + 1} заблокирован. Можно добавить следующий маршрут.`
    });
  };

  const handleEditRoute = (routeId: string) => {
    setRoutes(routes.map(r => 
      r.id === routeId ? { ...r, isLocked: false } : r
    ));
    
    setLockedRoutes(prev => {
      const newSet = new Set(prev);
      newSet.delete(routeId);
      return newSet;
    });
    
    toast({
      title: 'Редактирование маршрута',
      description: 'Маршрут разблокирован для редактирования'
    });
  };

  const handleAddRoute = () => {
    setRoutes([...routes, { id: Date.now().toString(), from: '', to: '', vehicleId: '', driverName: '', loadingDate: '', additionalStops: [], isLocked: false }]);
  };

  const handleRemoveRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  const handleUpdateRoute = (id: string, field: 'from' | 'to' | 'vehicleId' | 'driverName' | 'loadingDate', value: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddStop = (routeId: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          additionalStops: [...r.additionalStops, { id: Date.now().toString(), type: 'loading', address: '', note: '' }]
        };
      }
      return r;
    }));
  };

  const handleRemoveStop = (routeId: string, stopId: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          additionalStops: r.additionalStops.filter(s => s.id !== stopId)
        };
      }
      return r;
    }));
  };

  const handleUpdateStop = (routeId: string, stopId: string, field: 'type' | 'address' | 'note', value: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          additionalStops: r.additionalStops.map(s => 
            s.id === stopId ? { ...s, [field]: value } : s
          )
        };
      }
      return r;
    }));
  };

  const handleAddConsignee = () => {
    setConsignees([...consignees, { id: Date.now().toString(), name: '', note: '' }]);
  };

  const handleRemoveConsignee = (id: string) => {
    if (consignees.length > 1) {
      setConsignees(consignees.filter(c => c.id !== id));
    }
  };

  const handleUpdateConsignee = (id: string, field: 'name' | 'note', value: string) => {
    setConsignees(consignees.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSelectConsignee = (consigneeId: string, contractor: Contractor) => {
    setConsignees(consignees.map(c => 
      c.id === consigneeId 
        ? { ...c, name: contractor.name, contractorId: contractor.id } 
        : c
    ));
    setShowConsigneeList(prev => ({ ...prev, [consigneeId]: false }));
    setSearchConsignee(prev => ({ ...prev, [consigneeId]: contractor.name }));
  };

  const handleSelectVehicle = (routeId: string, vehicle: Vehicle) => {
    const driver = drivers.find(d => d.id === vehicle.driverId);
    const driverFullName = driver 
      ? `${driver.lastName} ${driver.firstName}${driver.middleName ? ' ' + driver.middleName : ''}`
      : '';
    
    setRoutes(routes.map(r => 
      r.id === routeId 
        ? { ...r, vehicleId: vehicle.id?.toString() || '', driverName: driverFullName }
        : r
    ));
    setSearchVehicle(prev => ({ ...prev, [routeId]: `${vehicle.registrationNumber} / ${vehicle.trailerNumber}` }));
    setShowVehicleList(prev => ({ ...prev, [routeId]: false }));
  };

  return {
    handleCancel,
    confirmCancel,
    handleSave,
    handleSaveOrder,
    handleSaveAndGo,
    handleEditRoute,
    handleAddRoute,
    handleRemoveRoute,
    handleUpdateRoute,
    handleAddStop,
    handleRemoveStop,
    handleUpdateStop,
    handleAddConsignee,
    handleRemoveConsignee,
    handleUpdateConsignee,
    handleSelectConsignee,
    handleSelectVehicle,
    getFullRoute
  };
}
