import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddressInput from '@/components/AddressInput';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vehicle } from '@/api/vehicles';
import { Driver } from '@/api/drivers';
import { Route } from './types';

interface RouteSectionProps {
  routes: Route[];
  isOrderLocked: boolean;
  onAddRoute: () => void;
  onRemoveRoute: (id: string) => void;
  onUpdateRoute: (id: string, field: 'from' | 'to' | 'vehicleId' | 'driverName' | 'loadingDate', value: string) => void;
  onSaveAndGo: (routeId: string, routeIndex: number) => void;
  onEditRoute: (routeId: string) => void;
  onAddStop: (routeId: string) => void;
  onRemoveStop: (routeId: string, stopId: string) => void;
  onUpdateStop: (routeId: string, stopId: string, field: 'type' | 'address' | 'note', value: string) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  searchVehicle: Record<string, string>;
  setSearchVehicle: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showVehicleList: Record<string, boolean>;
  setShowVehicleList: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  vehicleInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  loadingVehicles: boolean;
}

export default function RouteSection({
  routes,
  isOrderLocked,
  onAddRoute,
  onRemoveRoute,
  onUpdateRoute,
  onSaveAndGo,
  onEditRoute,
  onAddStop,
  onRemoveStop,
  onUpdateStop,
  vehicles,
  drivers,
  searchVehicle,
  setSearchVehicle,
  showVehicleList,
  setShowVehicleList,
  vehicleInputRefs,
  loadingVehicles,
}: RouteSectionProps) {
  const getFilteredVehicles = (routeId: string) => {
    const query = (searchVehicle[routeId] || '').toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter(v => 
      v.registrationNumber.toLowerCase().includes(query) ||
      v.trailerNumber?.toLowerCase().includes(query)
    );
  };

  const handleSelectVehicle = (routeId: string, vehicle: Vehicle) => {
    const driver = drivers.find(d => d.id === vehicle.driverId);
    const driverName = driver 
      ? `${driver.lastName} ${driver.firstName}${driver.middleName ? ' ' + driver.middleName : ''}`
      : '';
    
    onUpdateRoute(routeId, 'vehicleId', vehicle.id.toString());
    onUpdateRoute(routeId, 'driverName', driverName);
    setSearchVehicle(prev => ({ ...prev, [routeId]: `${vehicle.registrationNumber} / ${vehicle.trailerNumber}` }));
    setShowVehicleList(prev => ({ ...prev, [routeId]: false }));
  };
  if (routes.length === 0 && isOrderLocked) {
    return (
      <button
        onClick={onAddRoute}
        className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Icon name="Plus" size={20} />
        <span>Добавить маршрут</span>
      </button>
    );
  }

  if (routes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {routes.map((route, index) => {
        const isRouteDisabled = route.isLocked;
        return (
          <div key={route.id} className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Маршрут {index + 1}</h2>
              </div>
              {!isRouteDisabled && routes.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRoute(route.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Откуда</Label>
                <AddressInput
                  placeholder="Город отправления"
                  value={route.from}
                  onChange={(value) => onUpdateRoute(route.id, 'from', value)}
                  disabled={isRouteDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Куда</Label>
                <AddressInput
                  placeholder="Город назначения"
                  value={route.to}
                  onChange={(value) => onUpdateRoute(route.id, 'to', value)}
                  disabled={isRouteDisabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Авто</Label>
                <div className="relative">
                  <Input
                    ref={(el) => {
                      vehicleInputRefs.current[route.id] = el;
                    }}
                    placeholder="Поиск авто..."
                    value={searchVehicle[route.id] || ''}
                    onChange={(e) => {
                      setSearchVehicle(prev => ({ ...prev, [route.id]: e.target.value }));
                      setShowVehicleList(prev => ({ ...prev, [route.id]: true }));
                    }}
                    onFocus={() => setShowVehicleList(prev => ({ ...prev, [route.id]: true }))}
                    disabled={isRouteDisabled}
                  />
                  {showVehicleList[route.id] && !isRouteDisabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {loadingVehicles ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">Загрузка...</div>
                      ) : getFilteredVehicles(route.id).length > 0 ? (
                        getFilteredVehicles(route.id).map((vehicle) => {
                          const driver = drivers.find(d => d.id === vehicle.driverId);
                          const driverName = driver 
                            ? `${driver.lastName} ${driver.firstName}${driver.middleName ? ' ' + driver.middleName : ''}`
                            : 'Не назначен';
                          
                          return (
                            <button
                              key={vehicle.id}
                              onClick={() => handleSelectVehicle(route.id, vehicle)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-sm">
                                {vehicle.registrationNumber} / {vehicle.trailerNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Водитель: {driverName}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground text-center">Автомобили не найдены</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Водитель</Label>
                <Input
                  placeholder="Водитель"
                  value={route.driverName}
                  readOnly
                  className="bg-gray-50"
                  disabled={isRouteDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Дата погрузки</Label>
                <Input
                  type="date"
                  value={route.loadingDate}
                  onChange={(e) => onUpdateRoute(route.id, 'loadingDate', e.target.value)}
                  disabled={isRouteDisabled}
                />
              </div>
            </div>

            {route.additionalStops.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Дополнительные пункты</Label>
                <div className="space-y-3">
                  {route.additionalStops.map((stop) => (
                    <div key={stop.id} className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <Select
                          value={stop.type}
                          onValueChange={(value) => onUpdateStop(route.id, stop.id, 'type', value)}
                          disabled={isRouteDisabled}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="loading">Погрузка</SelectItem>
                            <SelectItem value="unloading">Разгрузка</SelectItem>
                            <SelectItem value="customs">Таможня</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1">
                          <AddressInput
                            placeholder="Адрес"
                            value={stop.address}
                            onChange={(value) => onUpdateStop(route.id, stop.id, 'address', value)}
                            disabled={isRouteDisabled}
                          />
                        </div>
                        {!isRouteDisabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveStop(route.id, stop.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Примечание"
                        value={stop.note}
                        onChange={(e) => onUpdateStop(route.id, stop.id, 'note', e.target.value)}
                        disabled={isRouteDisabled}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isRouteDisabled && (
              <button
                onClick={() => onAddStop(route.id)}
                className="w-full border border-dashed border-border rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon name="Plus" size={16} />
                <span>Дополнительный пункт</span>
              </button>
            )}

            {!isRouteDisabled && (
              <Button
                onClick={() => onSaveAndGo(route.id, index)}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <Icon name="Lock" size={18} />
                <span>Сохранить и поехали!</span>
              </Button>
            )}

            {isRouteDisabled && (
              <Button
                onClick={() => onEditRoute(route.id)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2"
              >
                <Icon name="Pencil" size={18} />
                <span>Редактировать маршрут</span>
              </Button>
            )}
          </div>
        );
      })}

      {isOrderLocked && routes.every(r => r.isLocked) && (
        <button
          onClick={onAddRoute}
          className="w-full border border-dashed border-border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Icon name="Plus" size={18} />
          <span>Добавить следующий маршрут</span>
        </button>
      )}
    </div>
  );
}