import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TopBar from '@/components/TopBar';
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
  const [customer, setCustomer] = useState('');
  const [carrier, setCarrier] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleCapacityTons, setVehicleCapacityTons] = useState('');
  const [vehicleCapacityM3, setVehicleCapacityM3] = useState('');
  const [temperatureMode, setTemperatureMode] = useState('');
  const [additionalConditions, setAdditionalConditions] = useState('');
  const [cargo, setCargo] = useState('');
  const [loadingAddress, setLoadingAddress] = useState('');
  const [loadingContact, setLoadingContact] = useState('');
  const [loadingDate, setLoadingDate] = useState('');
  const [unloadingAddress, setUnloadingAddress] = useState('');
  const [unloadingContact, setUnloadingContact] = useState('');
  const [unloadingDate, setUnloadingDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [taxationType, setTaxationType] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPassport, setDriverPassport] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleData, setVehicleData] = useState('');

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
              <div className="space-y-2">
                <Label htmlFor="customer">Заказчик *</Label>
                <Input 
                  id="customer" 
                  placeholder="ООО \"ФЛАУЗР МАСТЕР\"" 
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier">Перевозчик *</Label>
                <Input 
                  id="carrier" 
                  placeholder="ООО \"Везет 56\"" 
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
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
              <div className="space-y-2">
                <Label htmlFor="loadingAddress">Адрес погрузки *</Label>
                <Textarea 
                  id="loadingAddress" 
                  placeholder="Московская область, городской округ Люберцы, деревня Островцы, ул. Школьная 27" 
                  value={loadingAddress}
                  onChange={(e) => setLoadingAddress(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loadingContact">Контактное лицо</Label>
                  <Textarea 
                    id="loadingContact" 
                    placeholder="Константин зав складом 89104355433, Артем 89035532883" 
                    value={loadingContact}
                    onChange={(e) => setLoadingContact(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
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
          </div>

          {/* Разгрузка */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="ArrowDownCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Разгрузка</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unloadingAddress">Адрес разгрузки *</Label>
                <Textarea 
                  id="unloadingAddress" 
                  placeholder="РТ, Анастовский район, п.г.т Анастово, улица Заводская дом 21" 
                  value={unloadingAddress}
                  onChange={(e) => setUnloadingAddress(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unloadingContact">Контактное лицо</Label>
                  <Textarea 
                    id="unloadingContact" 
                    placeholder="Лилия Фирдусовна +7 903 340-83-67" 
                    value={unloadingContact}
                    onChange={(e) => setUnloadingContact(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">ФИО водителя</Label>
                  <Input 
                    id="driverName" 
                    placeholder="Гусев Алексей Вячеславович" 
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Телефон водителя</Label>
                  <Input 
                    id="driverPhone" 
                    placeholder="ву 9918 433698, 8-903-346-26-24" 
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPassport">Паспорт</Label>
                <Input 
                  id="driverPassport" 
                  placeholder="9718 341688 МВД по Чувашской Республике 13-03-2018" 
                  value={driverPassport}
                  onChange={(e) => setDriverPassport(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Данные ТС */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Truck" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Данные ТС</h2>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleData">Данные транспортного средства</Label>
              <Input 
                id="vehicleData" 
                placeholder="Фрейтлайнер Н9727У199 АV472247" 
                value={vehicleData}
                onChange={(e) => setVehicleData(e.target.value)}
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