import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    
    const passport = `${driver.passportSeries || ''} ${driver.passportNumber || ''} ${driver.passportIssued || ''} ${driver.passportDate || ''}`.trim();
    const license = `${driver.licenseSeries || ''} ${driver.licenseNumber || ''} ${driver.licenseIssued || ''} ${driver.licenseDate || ''}`.trim();
    setDriverLicense(license);
    
    const vehicle = vehicles.find(v => v.driverId === driver.id);
    if (vehicle) {
      const vehicleInfo = `${vehicle.registrationNumber || ''} ${vehicle.trailerNumber || ''}`.trim();
    }
    
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
      // TODO: Добавить API запрос для сохранения договора-заявки
      
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
              <Icon name="FileText" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractNumber">Номер договора-заявки *</Label>
                <Input 
                  id="contractNumber" 
                  placeholder="19120M1" 
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractDate">Дата *</Label>
                <Input 
                  id="contractDate" 
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Стороны договора */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Стороны договора</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 relative" data-dropdown>
                <Label htmlFor="customer">Заказчик *</Label>
                <Input 
                  id="customer" 
                  placeholder='ООО "ФЛАУЗР МАСТЕР"' 
                  value={searchCustomer}
                  onChange={(e) => {
                    setSearchCustomer(e.target.value);
                    setShowCustomerList(true);
                  }}
                  onFocus={() => setShowCustomerList(true)}
                />
                {showCustomerList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto" data-dropdown>
                    {loadingData ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
                    ) : getFilteredContractors('buyer', searchCustomer).length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Контрагенты с ролью "Покупатель" не найдены</div>
                    ) : (
                      getFilteredContractors('buyer', searchCustomer).map((contractor) => (
                        <button
                          key={contractor.id}
                          onClick={() => handleSelectCustomer(contractor)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          {contractor.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2 relative" data-dropdown>
                <Label htmlFor="carrier">Перевозчик *</Label>
                <Input 
                  id="carrier" 
                  placeholder='ООО "Везет 56"' 
                  value={searchCarrier}
                  onChange={(e) => {
                    setSearchCarrier(e.target.value);
                    setShowCarrierList(true);
                  }}
                  onFocus={() => setShowCarrierList(true)}
                />
                {showCarrierList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingData ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
                    ) : getFilteredContractors('carrier', searchCarrier).length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Контрагенты с ролью "Перевозчик" не найдены</div>
                    ) : (
                      getFilteredContractors('carrier', searchCarrier).map((contractor) => (
                        <button
                          key={contractor.id}
                          onClick={() => handleSelectCarrier(contractor)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          {contractor.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Транспортное средство */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Truck" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Требуемый тип ТС</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Тип кузова *</Label>
                  <Input 
                    id="vehicleType" 
                    placeholder="рефрижератор" 
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleCapacityTons">Вес (т) *</Label>
                  <Input 
                    id="vehicleCapacityTons" 
                    placeholder="20" 
                    value={vehicleCapacityTons}
                    onChange={(e) => setVehicleCapacityTons(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleCapacityM3">Объем (м³) *</Label>
                  <Input 
                    id="vehicleCapacityM3" 
                    placeholder="82" 
                    value={vehicleCapacityM3}
                    onChange={(e) => setVehicleCapacityM3(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Особые условия */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Особые условия</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperatureMode">Температурный режим</Label>
                <Input 
                  id="temperatureMode" 
                  placeholder="t режим +2 град" 
                  value={temperatureMode}
                  onChange={(e) => setTemperatureMode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalConditions">Дополнительные условия</Label>
                <Input 
                  id="additionalConditions" 
                  placeholder="водителю быть на связи" 
                  value={additionalConditions}
                  onChange={(e) => setAdditionalConditions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Груз */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Package" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Груз</h2>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cargo">Наименование груза *</Label>
              <Input 
                id="cargo" 
                placeholder="Луковицы" 
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
          </div>

          {/* Погрузка */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="ArrowUpCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Погрузка</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 relative" data-dropdown>
                <Label htmlFor="loadingSeller">Фирма (Продавец) *</Label>
                <Input 
                  id="loadingSeller" 
                  placeholder="Выберите продавца" 
                  value={searchLoadingSeller}
                  onChange={(e) => {
                    setSearchLoadingSeller(e.target.value);
                    setShowLoadingSellerList(true);
                  }}
                  onFocus={() => setShowLoadingSellerList(true)}
                />
                {showLoadingSellerList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingData ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
                    ) : getFilteredContractors('seller', searchLoadingSeller).length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Контрагенты с ролью "Продавец" не найдены</div>
                    ) : (
                      getFilteredContractors('seller', searchLoadingSeller).map((contractor) => (
                        <button
                          key={contractor.id}
                          onClick={() => handleSelectLoadingSeller(contractor)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <div className="font-medium">{contractor.name}</div>
                          {contractor.actualAddress && (
                            <div className="text-xs text-muted-foreground truncate">{contractor.actualAddress}</div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {loadingSellerId && (() => {
                const seller = contractors.find(c => c.id === loadingSellerId);
                return seller ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Адрес: </span>
                        <span className="text-muted-foreground">{seller.actualAddress || seller.legalAddress || 'Не указан'}</span>
                      </div>
                      {seller.deliveryAddresses && seller.deliveryAddresses.length > 0 && (
                        <div>
                          <span className="font-medium">Контакты: </span>
                          <span className="text-muted-foreground">
                            {seller.deliveryAddresses.map(da => `${da.contact} ${da.phone}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : null;
              })()}
              
              <div className="space-y-2">
                <Label htmlFor="loadingDate">Дата погрузки</Label>
                <Input 
                  id="loadingDate" 
                  placeholder="19.12.25" 
                  value={loadingDate}
                  onChange={(e) => setLoadingDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Разгрузка */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="ArrowDownCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Разгрузка</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 relative" data-dropdown>
                <Label htmlFor="unloadingBuyer">Фирма (Покупатель) *</Label>
                <Input 
                  id="unloadingBuyer" 
                  placeholder="Выберите покупателя" 
                  value={searchUnloadingBuyer}
                  onChange={(e) => {
                    setSearchUnloadingBuyer(e.target.value);
                    setShowUnloadingBuyerList(true);
                  }}
                  onFocus={() => setShowUnloadingBuyerList(true)}
                />
                {showUnloadingBuyerList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingData ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
                    ) : getFilteredContractors('buyer', searchUnloadingBuyer).length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Контрагенты с ролью "Покупатель" не найдены</div>
                    ) : (
                      getFilteredContractors('buyer', searchUnloadingBuyer).map((contractor) => (
                        <button
                          key={contractor.id}
                          onClick={() => handleSelectUnloadingBuyer(contractor)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <div className="font-medium">{contractor.name}</div>
                          {contractor.actualAddress && (
                            <div className="text-xs text-muted-foreground truncate">{contractor.actualAddress}</div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {unloadingBuyerId && (() => {
                const buyer = contractors.find(c => c.id === unloadingBuyerId);
                return buyer ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Адрес: </span>
                        <span className="text-muted-foreground">{buyer.actualAddress || buyer.legalAddress || 'Не указан'}</span>
                      </div>
                      {buyer.deliveryAddresses && buyer.deliveryAddresses.length > 0 && (
                        <div>
                          <span className="font-medium">Контакты: </span>
                          <span className="text-muted-foreground">
                            {buyer.deliveryAddresses.map(da => `${da.contact} ${da.phone}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : null;
              })()}
              
              <div className="space-y-2">
                <Label htmlFor="unloadingDate">Дата разгрузки</Label>
                <Input 
                  id="unloadingDate" 
                  placeholder="20-21.12.2025" 
                  value={unloadingDate}
                  onChange={(e) => setUnloadingDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Оплата */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="DollarSign" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Оплата</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Сумма (руб.) *</Label>
                  <Input 
                    id="paymentAmount" 
                    placeholder="150 000" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxationType">Вид налогообложения</Label>
                  <Input 
                    id="taxationType" 
                    placeholder="с НДС" 
                    value={taxationType}
                    onChange={(e) => setTaxationType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Условия оплаты</Label>
                  <Input 
                    id="paymentTerms" 
                    placeholder="5-7 б/д" 
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Данные водителя */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Данные водителя</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 relative" data-dropdown>
                <Label htmlFor="driverName">ФИО водителя</Label>
                <Input 
                  id="driverName" 
                  placeholder="Начните вводить ФИО" 
                  value={searchDriver}
                  onChange={(e) => {
                    setSearchDriver(e.target.value);
                    setShowDriverList(true);
                  }}
                  onFocus={() => setShowDriverList(true)}
                />
                {showDriverList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingData ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
                    ) : getFilteredDrivers(searchDriver).length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">Водители не найдены</div>
                    ) : (
                      getFilteredDrivers(searchDriver).map((driver) => (
                        <button
                          key={driver.id}
                          onClick={() => handleSelectDriver(driver)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <div className="font-medium">
                            {driver.lastName} {driver.firstName} {driver.middleName || ''}
                          </div>
                          <div className="text-xs text-muted-foreground">{driver.phone}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {driverId && (() => {
                const driver = drivers.find(d => d.id === driverId);
                const vehicle = vehicles.find(v => v.driverId === driverId);
                return driver ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Телефон: </span>
                          <span className="text-muted-foreground">{driver.phone}</span>
                        </div>
                        {driver.phoneExtra && (
                          <div>
                            <span className="font-medium">Доп. телефон: </span>
                            <span className="text-muted-foreground">{driver.phoneExtra}</span>
                          </div>
                        )}
                      </div>
                      
                      {(driver.licenseSeries || driver.licenseNumber) && (
                        <div>
                          <span className="font-medium">Вод. удостоверение: </span>
                          <span className="text-muted-foreground">
                            {driver.licenseSeries} {driver.licenseNumber} {driver.licenseIssued} {driver.licenseDate}
                          </span>
                        </div>
                      )}
                      
                      {(driver.passportSeries || driver.passportNumber) && (
                        <div>
                          <span className="font-medium">Паспорт: </span>
                          <span className="text-muted-foreground">
                            {driver.passportSeries} {driver.passportNumber} {driver.passportIssued} {driver.passportDate}
                          </span>
                        </div>
                      )}
                      
                      {vehicle && (
                        <div>
                          <span className="font-medium">ТС: </span>
                          <span className="text-muted-foreground">
                            {vehicle.registrationNumber} / {vehicle.trailerNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
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

export default AddContract;