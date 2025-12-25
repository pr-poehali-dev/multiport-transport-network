import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddVehicle from './AddVehicle';
import { getVehicles, deleteVehicle, Vehicle } from '@/api/vehicles';
import { getDrivers, Driver } from '@/api/drivers';
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

interface VehiclesProps {
  onMenuClick: () => void;
}

function Vehicles({ onMenuClick }: VehiclesProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const [vehiclesData, driversData] = await Promise.all([
        getVehicles(),
        getDrivers()
      ]);
      setVehicles(vehiclesData.vehicles);
      setFilteredVehicles(vehiclesData.vehicles);
      setDrivers(driversData.drivers || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список автомобилей'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter(vehicle => {
      const brandModel = `${vehicle.brand}`.toLowerCase();
      const registration = vehicle.registrationNumber.toLowerCase();
      const trailerType = (vehicle.trailerType || '').toLowerCase();
      
      return brandModel.includes(query) || 
             registration.includes(query) || 
             trailerType.includes(query);
    });

    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const handleRefresh = () => {
    loadVehicles();
    toast({
      title: 'Обновлено',
      description: 'Список автомобилей обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setVehicleToEdit(null);
    loadVehicles();
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsAdding(true);
  };

  const handleDeleteClick = (vehicleId: number) => {
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      const result = await deleteVehicle(vehicleToDelete);
      
      toast({
        title: 'Автомобиль удалён',
        description: result.message || 'Автомобиль успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      loadVehicles();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить автомобиль'
      });
    }
  };

  if (isAdding) {
    return <AddVehicle vehicle={vehicleToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Автомобили"
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
              placeholder="Поиск по марке, модели, гос. номеру, VIN..."
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
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Найдено автомобилей: <span className="font-semibold text-foreground">{filteredVehicles?.length || 0}</span>
            </p>
          )}
        </div>

        {/* Список автомобилей */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : !filteredVehicles || filteredVehicles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Car" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет автомобилей'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const driver = drivers.find(d => d.id === vehicle.driverId);
              
              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
                >
                  {/* Заголовок */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0ea5e9]/10 rounded-full">
                      <Icon name="Truck" size={24} className="text-[#0ea5e9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {vehicle.brand}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteClick(vehicle.id!)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {vehicle.registrationNumber}
                        {vehicle.trailerNumber && ` / ${vehicle.trailerNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="space-y-2.5 text-sm border-t pt-3">
                    {driver && (
                      <div className="flex items-center gap-2">
                        <Icon name="UserCircle" size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{driver.lastName} {driver.firstName} {driver.middleName || ''}</span>
                      </div>
                    )}
                    {vehicle.companyId && (
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">фирма ТК</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы действительно хотите удалить этот автомобиль?
              Это действие нельзя будет отменить.
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

export default Vehicles;