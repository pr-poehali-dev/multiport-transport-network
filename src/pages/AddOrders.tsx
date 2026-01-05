import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { getVehicles, Vehicle } from '@/api/vehicles';
import { getContractors, Contractor } from '@/api/contractors';
import { getDrivers, Driver } from '@/api/drivers';
import { createOrder, updateOrder, Order } from '@/api/orders';
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
import { Route, Consignee } from './AddOrders/types';
import OrderInfoSection from './AddOrders/OrderInfoSection';
import RouteSection from './AddOrders/RouteSection';

interface AddOrdersProps {
  order?: Order;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddOrders({ order, onBack, onMenuClick }: AddOrdersProps) {
  const isEditMode = !!order;
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>(order?.routes.map((r, idx) => ({
    id: r.id?.toString() || idx.toString(),
    from: r.from,
    to: r.to,
    vehicleId: r.vehicleId?.toString() || '',
    driverName: r.driverName || '',
    loadingDate: r.loadingDate || '',
    additionalStops: r.additionalStops || [],
    isLocked: true
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchVehicle, setSearchVehicle] = useState<Record<string, string>>({});
  const [showVehicleList, setShowVehicleList] = useState<Record<string, boolean>>({});
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [searchConsignee, setSearchConsignee] = useState<Record<string, string>>({});
  const [showConsigneeList, setShowConsigneeList] = useState<Record<string, boolean>>({});
  const vehicleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lockedRoutes, setLockedRoutes] = useState<Set<string>>(new Set());
  const [isOrderLocked, setIsOrderLocked] = useState(!!order);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    // Проверка: заказ должен быть заблокирован
    if (!isOrderLocked) {
      toast({
        title: 'Ошибка',
        description: 'Сначала нужно сохранить заказ',
        variant: 'destructive'
      });
      return;
    }

    // Проверка: все маршруты должны быть заблокированы
    if (routes.length > 0 && routes.some(r => !r.isLocked)) {
      toast({
        title: 'Ошибка',
        description: 'Все маршруты должны быть сохранены',
        variant: 'destructive'
      });
      return;
    }

    try {
      const orderData = {
        prefix,
        orderDate,
        routeNumber,
        invoice,
        trak,
        weight: weight ? parseFloat(weight) : undefined,
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

  const loadContractorsList = async () => {
    if (loadingContractors || contractors.length > 0) return;
    
    setLoadingContractors(true);
    try {
      const response = await getContractors();
      setContractors(response.contractors || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список контрагентов',
        variant: 'destructive'
      });
    } finally {
      setLoadingContractors(false);
    }
  };

  const getFilteredContractors = (consigneeId: string) => {
    const search = searchConsignee[consigneeId]?.toLowerCase() || '';
    return contractors.filter(c => 
      c.isBuyer && c.name.toLowerCase().includes(search)
    );
  };

  useEffect(() => {
    if (routes.length > 0 && vehicles.length === 0) {
      loadVehiclesList();
    }
  }, [routes.length]);

  useEffect(() => {
    if (consignees.length > 0 && contractors.length === 0) {
      loadContractorsList();
    }
  }, [consignees.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close vehicle lists
      Object.entries(vehicleInputRefs.current).forEach(([routeId, ref]) => {
        if (ref && !ref.parentElement?.contains(target)) {
          setShowVehicleList(prev => ({ ...prev, [routeId]: false }));
        }
      });

      // Close consignee lists
      const consigneeInputs = document.querySelectorAll('[data-consignee-id]');
      consigneeInputs.forEach((input) => {
        const consigneeId = input.getAttribute('data-consignee-id');
        if (consigneeId && !input.parentElement?.contains(target)) {
          setShowConsigneeList(prev => ({ ...prev, [consigneeId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVehiclesList = async () => {
    setLoadingVehicles(true);
    try {
      const [vehiclesData, driversData] = await Promise.all([
        getVehicles(),
        getDrivers()
      ]);
      setVehicles(vehiclesData.vehicles || []);
      setDrivers(driversData.drivers || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список автомобилей'
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const getFilteredVehicles = (routeId: string) => {
    const search = searchVehicle[routeId]?.toLowerCase() || '';
    return vehicles.filter(v => 
      v.registrationNumber?.toLowerCase().includes(search) ||
      v.trailerNumber?.toLowerCase().includes(search)
    );
  };

  const handleSelectVehicle = (routeId: string, vehicle: Vehicle) => {
    // Найти водителя по driverId из vehicle
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать заказ' : 'Добавить заказ'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              <Icon name="Check" size={18} />
              <span className="hidden sm:inline">Сохранить</span>
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <OrderInfoSection
            prefix={prefix}
            setPrefix={setPrefix}
            orderDate={orderDate}
            setOrderDate={setOrderDate}
            routeNumber={routeNumber}
            invoice={invoice}
            setInvoice={setInvoice}
            trak={trak}
            setTrak={setTrak}
            weight={weight}
            setWeight={setWeight}
            consignees={consignees}
            isOrderLocked={isOrderLocked}
            searchConsignee={searchConsignee}
            setSearchConsignee={setSearchConsignee}
            showConsigneeList={showConsigneeList}
            setShowConsigneeList={setShowConsigneeList}
            loadingContractors={loadingContractors}
            getFilteredContractors={getFilteredContractors}
            handleSelectConsignee={handleSelectConsignee}
            handleUpdateConsignee={handleUpdateConsignee}
            handleRemoveConsignee={handleRemoveConsignee}
            handleAddConsignee={handleAddConsignee}
            handleSaveOrder={handleSaveOrder}
            getFullRoute={getFullRoute}
          />

          <RouteSection
            routes={routes}
            isOrderLocked={isOrderLocked}
            handleAddRoute={handleAddRoute}
            handleRemoveRoute={handleRemoveRoute}
            handleUpdateRoute={handleUpdateRoute}
            handleSaveAndGo={handleSaveAndGo}
            handleEditRoute={handleEditRoute}
            handleAddStop={handleAddStop}
            handleRemoveStop={handleRemoveStop}
            handleUpdateStop={handleUpdateStop}
            vehicles={vehicles}
            drivers={drivers}
            searchVehicle={searchVehicle}
            setSearchVehicle={setSearchVehicle}
            showVehicleList={showVehicleList}
            setShowVehicleList={setShowVehicleList}
            vehicleInputRefs={vehicleInputRefs}
            getFilteredVehicles={getFilteredVehicles}
            handleSelectVehicle={handleSelectVehicle}
            loadingVehicles={loadingVehicles}
          />
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon name="AlertTriangle" size={18} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left">Подтверждение отмены</AlertDialogTitle>
                <AlertDialogDescription className="text-left mt-2">
                  Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0 gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="m-0 bg-red-600 hover:bg-red-700 gap-2">
              <Icon name="LogOut" size={16} />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddOrders;