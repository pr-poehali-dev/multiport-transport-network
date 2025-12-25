import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddDriver from './AddDriver';
import { getDrivers, deleteDriver, Driver } from '@/api/drivers';
import { getVehicles, Vehicle } from '@/api/vehicles';
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

interface DriversProps {
  onMenuClick: () => void;
}

function Drivers({ onMenuClick }: DriversProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<number | null>(null);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const [driversData, vehiclesData] = await Promise.all([
        getDrivers(),
        getVehicles()
      ]);
      setDrivers(driversData.drivers);
      setFilteredDrivers(driversData.drivers);
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список водителей'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDrivers(drivers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = drivers.filter(driver => {
      const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.toLowerCase();
      const passport = `${driver.passportSeries || ''} ${driver.passportNumber || ''}`.toLowerCase();
      const phones = `${driver.phone} ${driver.phoneExtra || ''}`.toLowerCase();
      
      return fullName.includes(query) || 
             passport.includes(query) || 
             phones.includes(query);
    });

    setFilteredDrivers(filtered);
  }, [searchQuery, drivers]);

  const handleRefresh = () => {
    loadDrivers();
    toast({
      title: 'Обновлено',
      description: 'Список водителей обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setDriverToEdit(null);
    loadDrivers();
  };

  const handleEditDriver = (driver: Driver) => {
    setDriverToEdit(driver);
    setIsAdding(true);
  };

  const handleDeleteClick = (driverId: number) => {
    setDriverToDelete(driverId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      const result = await deleteDriver(driverToDelete);
      
      toast({
        title: 'Водитель удалён',
        description: result.message || 'Водитель успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
      loadDrivers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить водителя'
      });
    }
  };

  if (isAdding) {
    return <AddDriver driver={driverToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Водители"
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
              placeholder="Поиск по ФИО, паспорту, телефону..."
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
              Найдено водителей: <span className="font-semibold text-foreground">{filteredDrivers.length}</span>
            </p>
          )}
        </div>

        {/* Список водителей */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="UserCircle" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет водителей'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => {
              const driverVehicle = vehicles.find(v => v.driverId === driver.id);
              
              return (
                <div
                  key={driver.id}
                  className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
                >
                  {/* Заголовок */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0ea5e9]/10 rounded-full">
                      <Icon name="UserCircle" size={24} className="text-[#0ea5e9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {driver.lastName}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                            onClick={() => handleEditDriver(driver)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteClick(driver.id!)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {driver.firstName} {driver.middleName || ''}
                      </p>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Phone" size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{driver.phone}</span>
                    </div>
                    {driver.phoneExtra && (
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{driver.phoneExtra}</span>
                      </div>
                    )}
                  </div>

                  {/* Авто */}
                  {driverVehicle && (
                    <div className="space-y-2.5 text-sm border-t pt-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Truck" size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {driverVehicle.brand} • {driverVehicle.registrationNumber}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
              Вы действительно хотите удалить этого водителя?
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

export default Drivers;