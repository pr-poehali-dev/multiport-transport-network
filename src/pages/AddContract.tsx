import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import { getContractors, Contractor } from '@/api/contractors';
import { getDrivers, Driver } from '@/api/drivers';
import { getVehicles, Vehicle } from '@/api/vehicles';
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
import ContractBasicInfo from '@/components/contract/ContractBasicInfo';
import ContractCargoInfo from '@/components/contract/ContractCargoInfo';
import ContractPaymentInfo from '@/components/contract/ContractPaymentInfo';
import ContractDriverInfo from '@/components/contract/ContractDriverInfo';

interface AddContractProps {
  onBack: () => void;
  onMenuClick: () => void;
}

function AddContract({ onBack, onMenuClick }: AddContractProps) {
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [carrierId, setCarrierId] = useState<number | undefined>();
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleCapacityTons, setVehicleCapacityTons] = useState('');
  const [vehicleCapacityM3, setVehicleCapacityM3] = useState('');
  const [temperatureMode, setTemperatureMode] = useState('');
  const [additionalConditions, setAdditionalConditions] = useState('');
  const [cargo, setCargo] = useState('');
  const [loadingSellerId, setLoadingSellerId] = useState<number | undefined>();
  const [loadingDate, setLoadingDate] = useState('');
  const [unloadingBuyerId, setUnloadingBuyerId] = useState<number | undefined>();
  const [unloadingDate, setUnloadingDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [taxationType, setTaxationType] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [driverId, setDriverId] = useState<number | undefined>();
  const [driverLicense, setDriverLicense] = useState('');
  
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchCarrier, setSearchCarrier] = useState('');
  const [searchLoadingSeller, setSearchLoadingSeller] = useState('');
  const [searchUnloadingBuyer, setSearchUnloadingBuyer] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showCarrierList, setShowCarrierList] = useState(false);
  const [showLoadingSellerList, setShowLoadingSellerList] = useState(false);
  const [showUnloadingBuyerList, setShowUnloadingBuyerList] = useState(false);
  const [showDriverList, setShowDriverList] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [contractorsData, driversData, vehiclesData] = await Promise.all([
          getContractors(),
          getDrivers(),
          getVehicles()
        ]);
        setContractors(contractorsData.contractors || []);
        setDrivers(driversData.drivers || []);
        setVehicles(vehiclesData.vehicles || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Не удалось загрузить данные'
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowCustomerList(false);
        setShowCarrierList(false);
        setShowLoadingSellerList(false);
        setShowUnloadingBuyerList(false);
        setShowDriverList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredContractors = (role: 'buyer' | 'carrier' | 'seller', search: string) => {
    return contractors.filter(c => {
      const matchesRole = role === 'buyer' ? c.isBuyer : role === 'carrier' ? c.isCarrier : c.isSeller;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  };

  const getFilteredDrivers = (search: string) => {
    return drivers.filter(d => {
      const fullName = `${d.lastName} ${d.firstName} ${d.middleName || ''}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
  };

  const handleSelectCustomer = (contractor: Contractor) => {
    setCustomerId(contractor.id);
    setSearchCustomer(contractor.name);
    setShowCustomerList(false);
  };

  const handleSelectCarrier = (contractor: Contractor) => {
    setCarrierId(contractor.id);
    setSearchCarrier(contractor.name);
    setShowCarrierList(false);
  };

  const handleSelectLoadingSeller = (contractor: Contractor) => {
    setLoadingSellerId(contractor.id);
    setSearchLoadingSeller(contractor.name);
    setShowLoadingSellerList(false);
  };

  const handleSelectUnloadingBuyer = (contractor: Contractor) => {
    setUnloadingBuyerId(contractor.id);
    setSearchUnloadingBuyer(contractor.name);
    setShowUnloadingBuyerList(false);
  };

  const handleSelectDriver = (driver: Driver) => {
    setDriverId(driver.id);
    const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`;
    setSearchDriver(fullName);
    
    const license = `${driver.licenseSeries || ''} ${driver.licenseNumber || ''} ${driver.licenseIssued || ''} ${driver.licenseDate || ''}`.trim();
    setDriverLicense(license);
    
    setShowDriverList(false);
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!contractNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните номер договора'
      });
      return;
    }

    setIsSaving(true);

    try {
      
      toast({
        title: 'Успешно сохранено',
        description: 'Договор-заявка создан'
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить договор-заявку'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = getFilteredContractors('buyer', searchCustomer);
  const filteredCarriers = getFilteredContractors('carrier', searchCarrier);
  const filteredLoadingSellers = getFilteredContractors('seller', searchLoadingSeller);
  const filteredUnloadingBuyers = getFilteredContractors('buyer', searchUnloadingBuyer);
  const filteredDrivers = getFilteredDrivers(searchDriver);

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title="Добавить договор-заявку"
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
                  <Icon name="Save" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {loadingData ? (
          <div className="flex items-center justify-center h-full">
            <Icon name="Loader2" size={48} className="animate-spin text-[#0ea5e9]" />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <ContractBasicInfo
              contractNumber={contractNumber}
              setContractNumber={setContractNumber}
              contractDate={contractDate}
              setContractDate={setContractDate}
              customerId={customerId}
              searchCustomer={searchCustomer}
              setSearchCustomer={setSearchCustomer}
              showCustomerList={showCustomerList}
              setShowCustomerList={setShowCustomerList}
              handleSelectCustomer={handleSelectCustomer}
              filteredCustomers={filteredCustomers}
              carrierId={carrierId}
              searchCarrier={searchCarrier}
              setSearchCarrier={setSearchCarrier}
              showCarrierList={showCarrierList}
              setShowCarrierList={setShowCarrierList}
              handleSelectCarrier={handleSelectCarrier}
              filteredCarriers={filteredCarriers}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              vehicleCapacityTons={vehicleCapacityTons}
              setVehicleCapacityTons={setVehicleCapacityTons}
              vehicleCapacityM3={vehicleCapacityM3}
              setVehicleCapacityM3={setVehicleCapacityM3}
              temperatureMode={temperatureMode}
              setTemperatureMode={setTemperatureMode}
              additionalConditions={additionalConditions}
              setAdditionalConditions={setAdditionalConditions}
            />

            <ContractCargoInfo
              cargo={cargo}
              setCargo={setCargo}
              loadingSellerId={loadingSellerId}
              searchLoadingSeller={searchLoadingSeller}
              setSearchLoadingSeller={setSearchLoadingSeller}
              showLoadingSellerList={showLoadingSellerList}
              setShowLoadingSellerList={setShowLoadingSellerList}
              handleSelectLoadingSeller={handleSelectLoadingSeller}
              filteredLoadingSellers={filteredLoadingSellers}
              loadingDate={loadingDate}
              setLoadingDate={setLoadingDate}
              unloadingBuyerId={unloadingBuyerId}
              searchUnloadingBuyer={searchUnloadingBuyer}
              setSearchUnloadingBuyer={setSearchUnloadingBuyer}
              showUnloadingBuyerList={showUnloadingBuyerList}
              setShowUnloadingBuyerList={setShowUnloadingBuyerList}
              handleSelectUnloadingBuyer={handleSelectUnloadingBuyer}
              filteredUnloadingBuyers={filteredUnloadingBuyers}
              unloadingDate={unloadingDate}
              setUnloadingDate={setUnloadingDate}
            />

            <ContractPaymentInfo
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              taxationType={taxationType}
              setTaxationType={setTaxationType}
              paymentTerms={paymentTerms}
              setPaymentTerms={setPaymentTerms}
            />

            <ContractDriverInfo
              driverId={driverId}
              searchDriver={searchDriver}
              setSearchDriver={setSearchDriver}
              showDriverList={showDriverList}
              setShowDriverList={setShowDriverList}
              handleSelectDriver={handleSelectDriver}
              filteredDrivers={filteredDrivers}
              driverLicense={driverLicense}
              setDriverLicense={setDriverLicense}
            />
          </div>
        )}
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить создание договора?</AlertDialogTitle>
            <AlertDialogDescription>
              Все введённые данные будут потеряны. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Отменить и выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddContract;
