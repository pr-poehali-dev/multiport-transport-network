import { useState, useRef } from 'react';
import { Order, notifyOrderSaved, notifyRouteSaved } from '@/api/orders';
import { Route, Consignee } from './types';
import { useToast } from '@/hooks/use-toast';

export function useOrderForm(order?: Order) {
  const { toast } = useToast();
  const isEditMode = !!order;

  const [routes, setRoutes] = useState<Route[]>(order?.routes.map((r, idx) => ({
    id: r.id?.toString() || idx.toString(),
    from: r.from,
    to: r.to,
    vehicleId: r.vehicleId?.toString() || '',
    driverName: r.driverName || '',
    loadingDate: r.loadingDate || '',
    additionalStops: r.additionalStops || [],
    isLocked: false
  })) || []);

  const [prefix, setPrefix] = useState<string>(order?.prefix || 'EU');
  const [orderDate, setOrderDate] = useState<string>(order?.orderDate || new Date().toISOString().split('T')[0]);
  const [routeNumber, setRouteNumber] = useState<string>(order?.routeNumber || '');
  const [invoice, setInvoice] = useState<string>(order?.invoice || '');
  const [trak, setTrak] = useState<string>(order?.trak || '');
  const [weight, setWeight] = useState<string>(order?.weight?.toString() || '');
  const [consignees, setConsignees] = useState<Consignee[]>(order?.consignees.map((c, idx) => ({
    id: c.id?.toString() || idx.toString(),
    name: c.name,
    note: c.note || '',
    contractorId: c.contractorId
  })) || [{ id: '1', name: '', note: '' }]);

  const [searchVehicle, setSearchVehicle] = useState<Record<string, string>>({});
  const [showVehicleList, setShowVehicleList] = useState<Record<string, boolean>>({});
  const [searchConsignee, setSearchConsignee] = useState<Record<string, string>>({});
  const [showConsigneeList, setShowConsigneeList] = useState<Record<string, boolean>>({});
  const vehicleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lockedRoutes, setLockedRoutes] = useState<Set<string>>(new Set());
  const [isOrderLocked, setIsOrderLocked] = useState(!!order);

  const handleSaveOrder = async () => {
    setIsOrderLocked(true);
    
    try {
      await notifyOrderSaved({
        prefix,
        routeNumber
      });
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
    }
    
    toast({
      title: 'Заказ сохранен',
      description: 'Теперь можно создавать и блокировать маршруты'
    });
  };

  const handleSaveAndGo = async (routeId: string, routeIndex: number) => {
    const route = routes.find(r => r.id === routeId);
    
    setRoutes(routes.map(r => 
      r.id === routeId ? { ...r, isLocked: true } : r
    ));
    
    setLockedRoutes(prev => new Set(prev).add(routeId));
    
    if (route) {
      try {
        await notifyRouteSaved({
          routeNumber,
          driverName: route.driverName || 'Не указан',
          from: route.from,
          to: route.to
        });
      } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
      }
    }
    
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
    return `${prefix}${day}${month}${year}`;
  };

  const handleAddConsignee = () => {
    setConsignees([...consignees, { id: Date.now().toString(), name: '', note: '' }]);
  };

  const handleRemoveConsignee = (id: string) => {
    if (consignees.length > 1) {
      setConsignees(consignees.filter(c => c.id !== id));
    }
  };

  const handleUpdateConsignee = (id: string, field: 'name' | 'note' | 'contractorId', value: string | number | undefined) => {
    setConsignees(consignees.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return {
    isEditMode,
    routes,
    setRoutes,
    prefix,
    setPrefix,
    orderDate,
    setOrderDate,
    routeNumber,
    setRouteNumber,
    invoice,
    setInvoice,
    trak,
    setTrak,
    weight,
    setWeight,
    consignees,
    setConsignees,
    searchVehicle,
    setSearchVehicle,
    showVehicleList,
    setShowVehicleList,
    searchConsignee,
    setSearchConsignee,
    showConsigneeList,
    setShowConsigneeList,
    vehicleInputRefs,
    lockedRoutes,
    setLockedRoutes,
    isOrderLocked,
    setIsOrderLocked,
    handleSaveOrder,
    handleSaveAndGo,
    handleEditRoute,
    handleAddRoute,
    handleRemoveRoute,
    handleUpdateRoute,
    handleAddStop,
    handleRemoveStop,
    handleUpdateStop,
    getFullRoute,
    generateRouteNumber,
    handleAddConsignee,
    handleRemoveConsignee,
    handleUpdateConsignee
  };
}