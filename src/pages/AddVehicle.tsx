import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import { createVehicle, updateVehicle, Vehicle } from '@/api/vehicles';
import { getDrivers, Driver } from '@/api/drivers';
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

interface AddVehicleProps {
  vehicle?: Vehicle;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddVehicle({ vehicle, onBack, onMenuClick }: AddVehicleProps) {
  const { toast } = useToast();
  const isEditMode = !!vehicle;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [showDriver, setShowDriver] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [searchDriver, setSearchDriver] = useState('');
  const [showDriverList, setShowDriverList] = useState(false);
  const driverInputRef = useRef<HTMLInputElement>(null);
  
  // Основная информация
  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [registrationNumber, setRegistrationNumber] = useState(vehicle?.registrationNumber || '');
  const [capacity, setCapacity] = useState(vehicle?.capacity?.toString() || '');
  const [trailerNumber, setTrailerNumber] = useState(vehicle?.trailerNumber || '');
  const [trailerType, setTrailerType] = useState(vehicle?.trailerType || '');
  const [companyId, setCompanyId] = useState(vehicle?.companyId?.toString() || '');
  const [driverId, setDriverId] = useState(vehicle?.driverId?.toString() || '');

  // Показываем секции если есть данные
  useEffect(() => {
    if (vehicle) {
      setShowCompany(!!vehicle.companyId);
      setShowDriver(!!vehicle.driverId);
      if (vehicle.driverId) {
        const driver = drivers.find(d => d.id?.toString() === vehicle.driverId?.toString());
        if (driver) {
          setSearchDriver(`${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.trim());
        }
      }
    }
  }, [vehicle, drivers]);

  useEffect(() => {
    if (showDriver && drivers.length === 0) {
      loadDriversList();
    }
  }, [showDriver]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (driverInputRef.current && !driverInputRef.current.parentElement?.contains(target)) {
        setShowDriverList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDriversList = async () => {
    setLoadingDrivers(true);
    try {
      const data = await getDrivers();
      setDrivers(data.drivers || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список водителей'
      });
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!brand.trim() || !registrationNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Марка ТС, Номер ТС'
      });
      return;
    }

    setIsSaving(true);

    try {
      const vehicleData = {
        brand: brand.trim(),
        registrationNumber: registrationNumber.trim(),
        capacity: capacity ? parseFloat(capacity) : undefined,
        trailerNumber: trailerNumber.trim() || undefined,
        trailerType: trailerType.trim() || undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        driverId: driverId ? parseInt(driverId) : undefined
      };

      const data = isEditMode 
        ? await updateVehicle(vehicle.id!, vehicleData)
        : await createVehicle(vehicleData);

      toast({
        title: 'Успешно сохранено',
        description: data.message || (isEditMode ? 'Данные автомобиля обновлены' : 'Автомобиль добавлен в базу данных')
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить автомобиль'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
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
              disabled={isSaving}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Основная информация */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Car" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Транспортное средство</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Марка ТС *</Label>
                <Input 
                  id="brand" 
                  placeholder="КамАЗ 5320" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Номер ТС *</Label>
                <Input 
                  id="registrationNumber" 
                  placeholder="А123БВ777"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Грузоподъемность (тонн)</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  placeholder="20"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trailerNumber">Номер прицепа</Label>
                <Input 
                  id="trailerNumber" 
                  placeholder="В456ГД777"
                  value={trailerNumber}
                  onChange={(e) => setTrailerNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerType">Тип прицепа</Label>
                <Input 
                  id="trailerType" 
                  placeholder="рефрижератор, тент, борт и т.д."
                  value={trailerType}
                  onChange={(e) => setTrailerType(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Фирма ТК */}
          {!showCompany ? (
            <button
              onClick={() => setShowCompany(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить фирму ТК</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Building2" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Фирма ТК</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCompany(false);
                    setCompanyId('');
                  }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Выбор фирмы</Label>
                <Input 
                  id="companyId" 
                  placeholder="Выберите фирму (TODO: заменить на Select)"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Пока что введите ID фирмы. Позже будет выпадающий список.</p>
              </div>
            </div>
          )}

          {/* Назначить водителя */}
          {!showDriver ? (
            <button
              onClick={() => setShowDriver(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Назначить водителя</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Назначить водителя</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowDriver(false);
                    setDriverId('');
                    setSearchDriver('');
                  }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId">Водитель</Label>
                {loadingDrivers ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border border-input rounded-md">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>Загрузка водителей...</span>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3 border border-input rounded-md">Нет доступных водителей</div>
                ) : (
                  <div className="relative">
                    <Input
                      ref={driverInputRef}
                      placeholder="Начните вводить имя водителя..."
                      value={searchDriver}
                      onChange={(e) => {
                        setSearchDriver(e.target.value);
                        setShowDriverList(true);
                      }}
                      onFocus={() => setShowDriverList(true)}
                    />
                    {showDriverList && searchDriver && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                        {drivers
                          .filter((driver) => {
                            const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.toLowerCase();
                            return fullName.includes(searchDriver.toLowerCase());
                          })
                          .map((driver) => (
                            <button
                              key={driver.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent text-sm cursor-pointer"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setDriverId(driver.id?.toString() || '');
                                setSearchDriver(`${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.trim());
                                setShowDriverList(false);
                              }}
                            >
                              {driver.lastName} {driver.firstName} {driver.middleName || ''}
                            </button>
                          ))}
                        {drivers.filter((driver) => {
                          const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.toLowerCase();
                          return fullName.includes(searchDriver.toLowerCase());
                        }).length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Водитель не найден</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Диалог отмены */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              {isEditMode 
                ? 'Все несохранённые изменения будут потеряны. Вы уверены, что хотите выйти без сохранения?'
                : 'Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?'
              }
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

export default AddVehicle;