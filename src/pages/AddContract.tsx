import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TopBar from '@/components/TopBar';
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
import { useContractData } from './AddContract/useContractData';
import { useContractForm } from './AddContract/useContractForm';
import ContractorSelect from './AddContract/ContractorSelect';
import DriverSelect from './AddContract/DriverSelect';

interface AddContractProps {
  onBack: () => void;
  onMenuClick: () => void;
}

function AddContract({ onBack, onMenuClick }: AddContractProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { contractors, drivers, vehicles, loadingData } = useContractData();
  
  const {
    contractNumber,
    setContractNumber,
    contractDate,
    setContractDate,
    customerId,
    setCustomerId,
    carrierId,
    setCarrierId,
    vehicleType,
    setVehicleType,
    vehicleCapacityTons,
    setVehicleCapacityTons,
    vehicleCapacityM3,
    setVehicleCapacityM3,
    temperatureMode,
    setTemperatureMode,
    additionalConditions,
    setAdditionalConditions,
    cargo,
    setCargo,
    loadingSellerId,
    setLoadingSellerId,
    loadingDate,
    setLoadingDate,
    unloadingBuyerId,
    setUnloadingBuyerId,
    unloadingDate,
    setUnloadingDate,
    paymentAmount,
    setPaymentAmount,
    taxationType,
    setTaxationType,
    paymentTerms,
    setPaymentTerms,
    driverId,
    setDriverId,
    setDriverLicense,
    isSaving,
    handleSave
  } = useContractForm();

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
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
              onClick={() => handleSave(onBack)}
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
              <ContractorSelect
                label="Заказчик *"
                placeholder='ООО "ФЛАУЗР МАСТЕР"'
                role="buyer"
                contractors={contractors}
                loadingData={loadingData}
                selectedId={customerId}
                onSelect={(contractor) => setCustomerId(contractor.id)}
              />
              <ContractorSelect
                label="Перевозчик *"
                placeholder='ООО "Везет 56"'
                role="carrier"
                contractors={contractors}
                loadingData={loadingData}
                selectedId={carrierId}
                onSelect={(contractor) => setCarrierId(contractor.id)}
              />
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
              <ContractorSelect
                label="Фирма (Продавец) *"
                placeholder="Выберите продавца"
                role="seller"
                contractors={contractors}
                loadingData={loadingData}
                selectedId={loadingSellerId}
                onSelect={(contractor) => setLoadingSellerId(contractor.id)}
                showDetails
              />
              
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
              <ContractorSelect
                label="Фирма (Покупатель) *"
                placeholder="Выберите покупателя"
                role="buyer"
                contractors={contractors}
                loadingData={loadingData}
                selectedId={unloadingBuyerId}
                onSelect={(contractor) => setUnloadingBuyerId(contractor.id)}
                showDetails
              />
              
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
              <DriverSelect
                drivers={drivers}
                vehicles={vehicles}
                loadingData={loadingData}
                selectedId={driverId}
                onSelect={(driver, license) => {
                  setDriverId(driver.id);
                  setDriverLicense(license);
                }}
              />
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
