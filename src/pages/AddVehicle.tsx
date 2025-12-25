import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import { createVehicle, updateVehicle, Vehicle } from '@/api/vehicles';
import { getDrivers, Driver } from '@/api/drivers';
import { getContractors, Contractor } from '@/api/contractors';
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
import VehicleInfoSection from '@/components/vehicle/VehicleInfoSection';
import CompanySection from '@/components/vehicle/CompanySection';
import DriverSection from '@/components/vehicle/DriverSection';

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
  
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [searchContractor, setSearchContractor] = useState('');
  const [showContractorList, setShowContractorList] = useState(false);
  const contractorInputRef = useRef<HTMLInputElement>(null);
  
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
      if (vehicle.companyId) {
        const contractor = contractors.find(c => c.id?.toString() === vehicle.companyId?.toString());
        if (contractor) {
          setSearchContractor(contractor.name);
        }
      }
    }
  }, [vehicle, drivers, contractors]);

  useEffect(() => {
    if (showDriver && drivers.length === 0) {
      loadDriversList();
    }
  }, [showDriver]);

  useEffect(() => {
    if (showCompany && contractors.length === 0) {
      loadContractorsList();
    }
  }, [showCompany]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (driverInputRef.current && !driverInputRef.current.parentElement?.contains(target)) {
        setShowDriverList(false);
      }
      if (contractorInputRef.current && !contractorInputRef.current.parentElement?.contains(target)) {
        setShowContractorList(false);
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

  const loadContractorsList = async () => {
    setLoadingContractors(true);
    try {
      const data = await getContractors();
      setContractors(data.contractors || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список контрагентов'
      });
    } finally {
      setLoadingContractors(false);
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
          <VehicleInfoSection
            brand={brand}
            setBrand={setBrand}
            registrationNumber={registrationNumber}
            setRegistrationNumber={setRegistrationNumber}
            capacity={capacity}
            setCapacity={setCapacity}
            trailerNumber={trailerNumber}
            setTrailerNumber={setTrailerNumber}
            trailerType={trailerType}
            setTrailerType={setTrailerType}
          />

          {/* Фирма ТК */}
          <CompanySection
            showCompany={showCompany}
            setShowCompany={setShowCompany}
            searchContractor={searchContractor}
            setSearchContractor={setSearchContractor}
            showContractorList={showContractorList}
            setShowContractorList={setShowContractorList}
            contractors={contractors}
            loadingContractors={loadingContractors}
            contractorInputRef={contractorInputRef}
            setCompanyId={setCompanyId}
          />

          {/* Водитель */}
          <DriverSection
            showDriver={showDriver}
            setShowDriver={setShowDriver}
            searchDriver={searchDriver}
            setSearchDriver={setSearchDriver}
            showDriverList={showDriverList}
            setShowDriverList={setShowDriverList}
            drivers={drivers}
            loadingDrivers={loadingDrivers}
            driverInputRef={driverInputRef}
            setDriverId={setDriverId}
          />
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
