import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  isDirect: boolean;
  setIsDirect: (value: boolean) => void;
  isOrderLocked: boolean;
  handleAddRoute: () => void;
  handleRemoveRoute: (id: string) => void;
  handleUpdateRoute: (id: string, field: 'from' | 'to' | 'vehicleId' | 'driverName' | 'loadingDate', value: string) => void;
  handleSaveAndGo: (routeId: string, routeIndex: number) => void;
  handleEditRoute: (routeId: string) => void;
  handleAddStop: (routeId: string) => void;
  handleRemoveStop: (routeId: string, stopId: string) => void;
  handleUpdateStop: (routeId: string, stopId: string, field: 'type' | 'address', value: string) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  searchVehicle: Record<string, string>;
  setSearchVehicle: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showVehicleList: Record<string, boolean>;
  setShowVehicleList: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  vehicleInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  getFilteredVehicles: (routeId: string) => Vehicle[];
  handleSelectVehicle: (routeId: string, vehicle: Vehicle) => void;
  loadingVehicles: boolean;
}

export default function RouteSection({
  routes,
  isDirect,
  setIsDirect,
  isOrderLocked,
  handleAddRoute,
  handleRemoveRoute,
  handleUpdateRoute,
  handleSaveAndGo,
  handleEditRoute,
  handleAddStop,
  handleRemoveStop,
  handleUpdateStop,
  vehicles,
  drivers,
  searchVehicle,
  setSearchVehicle,
  showVehicleList,
  setShowVehicleList,
  vehicleInputRefs,
  getFilteredVehicles,
  handleSelectVehicle,
  loadingVehicles,
}: RouteSectionProps) {
  if (routes.length === 0 && isOrderLocked) {
    return (
      <button
        onClick={handleAddRoute}
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Маршрут {index + 1}</h2>
                </div>
                {index === 1 && !isRouteDisabled && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`direct-${route.id}`}
                      checked={isDirect}
                      onCheckedChange={(checked) => setIsDirect(checked as boolean)}
                    />
                    <label
                      htmlFor={`direct-${route.id}`}
                      className="text-sm cursor-pointer select-none"
                    >
                      Прямая
                    </label>
                  </div>
                )}
              </div>
              {!isRouteDisabled && routes.length > 1 && (
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
                  placeholder="Город отправления"
                  value={route.from}
                  onChange={(e) => handleUpdateRoute(route.id, 'from', e.target.value)}
                  disabled={isRouteDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Куда</Label>
                <Input
                  placeholder="Город назначения"
                  value={route.to}
                  onChange={(e) => handleUpdateRoute(route.id, 'to', e.target.value)}
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
                  onChange={(e) => handleUpdateRoute(route.id, 'loadingDate', e.target.value)}
                  disabled={isRouteDisabled}
                />
              </div>
            </div>

            {route.additionalStops.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Дополнительные пункты</Label>
                <div className="space-y-2">
                  {route.additionalStops.map((stop) => (
                    <div key={stop.id} className="flex gap-2 items-start">
                      <Select
                        value={stop.type}
                        onValueChange={(value) => handleUpdateStop(route.id, stop.id, 'type', value)}
                        disabled={isRouteDisabled}
                      >
                        <SelectTrigger className="w-[140px]">
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
                        disabled={isRouteDisabled}
                        className="flex-1"
                      />
                      {!isRouteDisabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStop(route.id, stop.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isRouteDisabled && (
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

            {isRouteDisabled && (
              <Button
                onClick={() => handleEditRoute(route.id)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2"
              >
                <Icon name="Pencil" size={18} />
                <span>Редактировать маршрут</span>
              </Button>
            )}
          </div>
        );
      })}

      {(!isDirect || routes.length < 2) && isOrderLocked && routes.every(r => r.isLocked) && (
        <button
          onClick={handleAddRoute}
          className="w-full border border-dashed border-border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Icon name="Plus" size={18} />
          <span>Добавить следующий маршрут</span>
        </button>
      )}
    </div>
  );
}