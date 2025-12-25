import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getVehicles, Vehicle } from '@/api/vehicles';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface AddOrdersProps {
  onBack: () => void;
  onMenuClick: () => void;
}

interface AdditionalStop {
  id: string;
  type: 'loading' | 'unloading';
  address: string;
}

interface Route {
  id: string;
  from: string;
  to: string;
  vehicleId: string;
  additionalStops: AdditionalStop[];
  isLocked: boolean;
}

interface Consignee {
  id: string;
  name: string;
  note: string;
}

function AddOrders({ onBack, onMenuClick }: AddOrdersProps) {
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [prefix, setPrefix] = useState<string>('EU');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [routeNumber, setRouteNumber] = useState<string>('');
  const [invoice, setInvoice] = useState<string>('');
  const [trak, setTrak] = useState<string>('');
  const [consignees, setConsignees] = useState<Consignee[]>([{ id: '1', name: '', note: '' }]);
  const [isDirect, setIsDirect] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [searchVehicle, setSearchVehicle] = useState<Record<string, string>>({});
  const [showVehicleList, setShowVehicleList] = useState<Record<string, boolean>>({});
  const vehicleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lockedRoutes, setLockedRoutes] = useState<Set<string>>(new Set());

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = () => {
    // Логика сохранения
    onBack();
  };

  const handleSaveAndGo = (routeId: string, routeIndex: number) => {
    setRoutes(routes.map(r => 
      r.id === routeId ? { ...r, isLocked: true } : r
    ));
    
    setLockedRoutes(prev => new Set(prev).add(routeId));
    
    toast({
      title: 'Сохранено',
      description: `Маршрут ${routeIndex + 1} заблокирован. Можно добавлять дополнительные пункты.`
    });
  };

  const handleAddRoute = () => {
    if (isDirect && routes.length >= 2) {
      return;
    }
    setRoutes([...routes, { id: Date.now().toString(), from: '', to: '', vehicleId: '', additionalStops: [], isLocked: false }]);
  };

  const handleRemoveRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
    if (routes.filter(r => r.id !== id).length < 2) {
      setIsDirect(false);
    }
  };

  const handleUpdateRoute = (id: string, field: 'from' | 'to' | 'vehicleId', value: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddStop = (routeId: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          additionalStops: [...r.additionalStops, { id: Date.now().toString(), type: 'loading', address: '' }]
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

  const handleUpdateStop = (routeId: string, stopId: string, field: 'type' | 'address', value: string) => {
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

  useEffect(() => {
    if (routes.length > 0 && vehicles.length === 0) {
      loadVehiclesList();
    }
  }, [routes.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      Object.entries(vehicleInputRefs.current).forEach(([routeId, ref]) => {
        if (ref && !ref.parentElement?.contains(target)) {
          setShowVehicleList(prev => ({ ...prev, [routeId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVehiclesList = async () => {
    setLoadingVehicles(true);
    try {
      const data = await getVehicles();
      setVehicles(data.vehicles || []);
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title="Добавить заказ"
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={16} />
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 bg-[#0ea5e9] hover:bg-[#0284c7]"
            >
              <Icon name="Check" size={16} />
              Сохранить
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Package" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Заказ</h2>
            </div>

            <div className="space-y-2">
              <Label>Маршрут</Label>
              <Input
                value={getFullRoute()}
                readOnly
                placeholder="Маршрут будет составлен из точек ниже"
                className="bg-gray-50"
                disabled={lockedRoutes.size > 0}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Префикс</Label>
                <Select value={prefix} onValueChange={setPrefix} disabled={lockedRoutes.size > 0}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="CH">CH</SelectItem>
                    <SelectItem value="RF">RF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Дата заказа</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  disabled={lockedRoutes.size > 0}
                />
              </div>

              <div className="space-y-2">
                <Label>Номер маршрута</Label>
                <Input
                  value={routeNumber}
                  readOnly
                  className="bg-gray-50"
                  disabled={lockedRoutes.size > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Инвойс</Label>
                <Input
                  placeholder="Введите номер инвойса"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  disabled={lockedRoutes.size > 0}
                />
              </div>

              <div className="space-y-2">
                <Label>TRAK</Label>
                <Input
                  placeholder="Введите TRAK"
                  value={trak}
                  onChange={(e) => setTrak(e.target.value)}
                  disabled={lockedRoutes.size > 0}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Грузополучатели</Label>
              {consignees.map((consignee, index) => (
                <div key={consignee.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder={`Грузополучатель ${index + 1}`}
                      value={consignee.name}
                      onChange={(e) => handleUpdateConsignee(consignee.id, 'name', e.target.value)}
                      disabled={lockedRoutes.size > 0}
                    />
                    <Input
                      placeholder="Примечание"
                      value={consignee.note}
                      onChange={(e) => handleUpdateConsignee(consignee.id, 'note', e.target.value)}
                      disabled={lockedRoutes.size > 0}
                    />
                  </div>
                  {consignees.length > 1 && lockedRoutes.size === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConsignee(consignee.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  )}
                </div>
              ))}
              {lockedRoutes.size === 0 && (
                <button
                  onClick={handleAddConsignee}
                  className="w-full border border-dashed border-border rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Icon name="Plus" size={16} />
                  <span>Добавить грузополучателя</span>
                </button>
              )}
            </div>
          </div>

          {routes.length > 0 && (
            <div className="space-y-3">
              {routes.map((route, index) => {
                const isRouteDisabled = route.isLocked;
                return (
                  <div key={route.id} className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
                          <h2 className="text-base lg:text-lg font-semibold text-foreground">Маршрут {index + 1}</h2>
                          {isRouteDisabled && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Заблокирован</span>
                          )}
                        </div>
                        {index === 0 && lockedRoutes.size === 0 && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="direct-route"
                              checked={isDirect}
                              onCheckedChange={(checked) => {
                                setIsDirect(checked as boolean);
                                if (checked && routes.length > 2) {
                                  setRoutes(routes.slice(0, 2));
                                }
                              }}
                            />
                            <Label htmlFor="direct-route" className="text-sm cursor-pointer">Прямой</Label>
                          </div>
                        )}
                      </div>
                      {!isRouteDisabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRoute(route.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Откуда</Label>
                        <Input
                          placeholder="Москва"
                          value={route.from}
                          onChange={(e) => handleUpdateRoute(route.id, 'from', e.target.value)}
                          disabled={isRouteDisabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Куда</Label>
                        <Input
                          placeholder="Санкт-Петербург"
                          value={route.to}
                          onChange={(e) => handleUpdateRoute(route.id, 'to', e.target.value)}
                          disabled={isRouteDisabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <Label>Автомобиль</Label>
                      <div className="relative" ref={(el) => vehicleInputRefs.current[route.id] = el}>
                        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                        <Input
                          placeholder="Начните вводить марку или гос. номер..."
                          value={searchVehicle[route.id] || ''}
                          onChange={(e) => {
                            setSearchVehicle({ ...searchVehicle, [route.id]: e.target.value });
                            setShowVehicleList({ ...showVehicleList, [route.id]: true });
                          }}
                          onFocus={() => setShowVehicleList({ ...showVehicleList, [route.id]: true })}
                          className="pl-9"
                          disabled={isRouteDisabled}
                        />
                        {loadingVehicles && (
                          <Icon name="Loader2" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                        
                        {showVehicleList[route.id] && vehicles.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {vehicles
                              .filter(v => {
                                const searchStr = (searchVehicle[route.id] || '').toLowerCase();
                                const vehicleStr = `${v.brand} ${v.registrationNumber}`.toLowerCase();
                                return vehicleStr.includes(searchStr);
                              })
                              .map(vehicle => (
                                <button
                                  key={vehicle.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateRoute(route.id, 'vehicleId', vehicle.id?.toString() || '');
                                    setSearchVehicle({ ...searchVehicle, [route.id]: `${vehicle.brand} - ${vehicle.registrationNumber}` });
                                    setShowVehicleList({ ...showVehicleList, [route.id]: false });
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-border last:border-0"
                                >
                                  <Icon name="Truck" size={18} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {vehicle.brand} - {vehicle.registrationNumber}
                                    </p>
                                    {vehicle.capacity && (
                                      <p className="text-xs text-muted-foreground">Грузоподъемность: {vehicle.capacity} т</p>
                                    )}
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Выберите автомобиль для этого маршрута
                      </p>
                    </div>

                    {route.additionalStops.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <Label className="text-sm text-muted-foreground">Дополнительные пункты</Label>
                        {route.additionalStops.map((stop) => (
                          <div key={stop.id} className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Select 
                                value={stop.type} 
                                onValueChange={(value) => handleUpdateStop(route.id, stop.id, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="loading">Погрузка</SelectItem>
                                  <SelectItem value="unloading">Разгрузка</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Адрес"
                                value={stop.address}
                                onChange={(e) => handleUpdateStop(route.id, stop.id, 'address', e.target.value)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveStop(route.id, stop.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {isRouteDisabled && (
                      <button
                        onClick={() => handleAddStop(route.id)}
                        className="w-full border border-dashed border-border rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Plus" size={16} />
                        <span>Дополнительный пункт</span>
                      </button>
                    )}

                    {!isRouteDisabled && (
                      <Button
                        onClick={() => handleSaveAndGo(route.id, index)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        <Icon name="Lock" size={18} />
                        <span>Сохранить и поехали!</span>
                      </Button>
                    )}
                  </div>
                );
              })}

              {(!isDirect || routes.length < 2) && lockedRoutes.size === 0 && (
                <button
                  onClick={handleAddRoute}
                  className="w-full border border-dashed border-border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name="Plus" size={18} />
                  <span>Добавить маршрут</span>
                </button>
              )}
            </div>
          )}

          {routes.length === 0 && (
            <button
              onClick={handleAddRoute}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить маршрут</span>
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
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