import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import { Contractor } from './Contractors';
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

interface AddContractorProps {
  contractor?: Contractor;
  onBack: () => void;
  onMenuClick: () => void;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  bik: string;
  bankName: string;
  corrAccount: string;
}

interface DeliveryAddress {
  id: string;
  address: string;
  phone: string;
  contact: string;
}

function AddContractor({ contractor, onBack, onMenuClick }: AddContractorProps) {
  const { toast } = useToast();
  const isEditMode = !!contractor;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActualAddress, setShowActualAddress] = useState(false);
  const [showPostalAddress, setShowPostalAddress] = useState(false);
  const [actualSameAsLegal, setActualSameAsLegal] = useState(false);
  const [postalSameAsLegal, setPostalSameAsLegal] = useState(false);

  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState('');
  const [ogrn, setOgrn] = useState('');
  const [director, setDirector] = useState('');
  const [legalAddress, setLegalAddress] = useState('');
  const [actualAddress, setActualAddress] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isCarrier, setIsCarrier] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);

  useEffect(() => {
    if (contractor) {
      setShowActualAddress(!!contractor.inn);
      setShowPostalAddress(!!contractor.email);
    }
  }, [contractor]);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleAddBank = () => {
    setBankAccounts([...bankAccounts, {
      id: Date.now().toString(),
      accountNumber: '',
      bik: '',
      bankName: '',
      corrAccount: ''
    }]);
  };

  const handleRemoveBank = (id: string) => {
    setBankAccounts(bankAccounts.filter(b => b.id !== id));
  };

  const handleUpdateBank = (id: string, field: keyof BankAccount, value: string) => {
    setBankAccounts(bankAccounts.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const handleAddDeliveryAddress = () => {
    setDeliveryAddresses([...deliveryAddresses, {
      id: Date.now().toString(),
      address: '',
      phone: '',
      contact: ''
    }]);
  };

  const handleRemoveDeliveryAddress = (id: string) => {
    setDeliveryAddresses(deliveryAddresses.filter(d => d.id !== id));
  };

  const handleUpdateDeliveryAddress = (id: string, field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddresses(deliveryAddresses.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleSave = async () => {
    if (!name.trim() || !inn.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Наименование, ИНН'
      });
      return;
    }

    setIsSaving(true);

    try {
      toast({
        title: 'Успешно сохранено',
        description: isEditMode ? 'Данные контрагента обновлены' : 'Контрагент добавлен в базу данных'
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить контрагента'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать контрагента' : 'Добавить контрагента'}
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
              <Icon name="Building2" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Наименование *</Label>
              <Input 
                id="name" 
                placeholder="ООО «ФЛАУЭР МАСТЕР»" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isSeller"
                    checked={isSeller}
                    onCheckedChange={(checked) => setIsSeller(checked as boolean)}
                  />
                  <Label 
                    htmlFor="isSeller"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Продавец
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isBuyer"
                    checked={isBuyer}
                    onCheckedChange={(checked) => setIsBuyer(checked as boolean)}
                  />
                  <Label 
                    htmlFor="isBuyer"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Покупатель
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isCarrier"
                    checked={isCarrier}
                    onCheckedChange={(checked) => setIsCarrier(checked as boolean)}
                  />
                  <Label 
                    htmlFor="isCarrier"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Перевозчик
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inn">ИНН *</Label>
                <Input 
                  id="inn" 
                  placeholder="7724449594"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpp">КПП</Label>
                <Input 
                  id="kpp" 
                  placeholder="772201001"
                  value={kpp}
                  onChange={(e) => setKpp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogrn">ОГРН</Label>
                <Input 
                  id="ogrn" 
                  placeholder="1187746741566"
                  value={ogrn}
                  onChange={(e) => setOgrn(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">ФИО руководителя</Label>
              <Input 
                id="director" 
                placeholder="Знаменский М.А"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
              />
            </div>
          </div>

          {/* Адреса */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Адреса</h2>
            </div>
            
            {/* Юридический адрес */}
            <div className="space-y-2">
              <Label htmlFor="legalAddress" className="font-semibold">Юридический адрес</Label>
              <Input 
                id="legalAddress" 
                placeholder="111024, Город Москва, вн.тер. г. Муниципальный Округ Лефортово..."
                value={legalAddress}
                onChange={(e) => setLegalAddress(e.target.value)}
              />
            </div>

            {/* Фактический адрес */}
            {!showActualAddress ? (
              <button
                onClick={() => setShowActualAddress(true)}
                className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon name="Plus" size={18} />
                <span>Добавить фактический адрес</span>
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Фактический адрес</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowActualAddress(false);
                      setActualAddress('');
                      setActualSameAsLegal(false);
                    }}
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="actualSameAsLegal"
                    checked={actualSameAsLegal}
                    onCheckedChange={(checked) => {
                      setActualSameAsLegal(checked as boolean);
                      if (checked) {
                        setActualAddress(legalAddress);
                      }
                    }}
                  />
                  <Label 
                    htmlFor="actualSameAsLegal"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Совпадает с юридическим адресом
                  </Label>
                </div>

                <Input 
                  id="actualAddress" 
                  placeholder="Введите фактический адрес"
                  value={actualAddress}
                  onChange={(e) => {
                    setActualAddress(e.target.value);
                    setActualSameAsLegal(false);
                  }}
                  disabled={actualSameAsLegal}
                />
              </div>
            )}

            {/* Почтовый адрес */}
            {!showPostalAddress ? (
              <button
                onClick={() => setShowPostalAddress(true)}
                className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon name="Plus" size={18} />
                <span>Добавить почтовый адрес</span>
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Почтовый адрес</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowPostalAddress(false);
                      setPostalAddress('');
                      setPostalSameAsLegal(false);
                    }}
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="postalSameAsLegal"
                    checked={postalSameAsLegal}
                    onCheckedChange={(checked) => {
                      setPostalSameAsLegal(checked as boolean);
                      if (checked) {
                        setPostalAddress(legalAddress);
                      }
                    }}
                  />
                  <Label 
                    htmlFor="postalSameAsLegal"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Совпадает с юридическим адресом
                  </Label>
                </div>

                <Input 
                  id="postalAddress" 
                  placeholder="Введите почтовый адрес"
                  value={postalAddress}
                  onChange={(e) => {
                    setPostalAddress(e.target.value);
                    setPostalSameAsLegal(false);
                  }}
                  disabled={postalSameAsLegal}
                />
              </div>
            )}

            {/* Адреса доставки */}
            {deliveryAddresses.length > 0 && deliveryAddresses.map((delivery) => (
              <div key={delivery.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Адрес доставки</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDeliveryAddress(delivery.id)}
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>

                <Input 
                  placeholder="Введите адрес доставки"
                  value={delivery.address}
                  onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'address', e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    placeholder="+7 (999) 123-45-67"
                    value={delivery.phone}
                    onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'phone', e.target.value)}
                  />
                  <Input 
                    placeholder="ФИО контактного лица"
                    value={delivery.contact}
                    onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'contact', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAddDeliveryAddress}
              className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={18} />
              <span>Добавить адрес доставки</span>
            </button>
          </div>

          {/* Банковские счета */}
          {bankAccounts.length > 0 && bankAccounts.map((bank) => (
            <div key={bank.id} className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Landmark" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Банковский счет</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBank(bank.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Расчетный счет</Label>
                  <Input 
                    placeholder="40702810600010002373"
                    value={bank.accountNumber}
                    onChange={(e) => handleUpdateBank(bank.id, 'accountNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>БИК</Label>
                  <Input 
                    placeholder="044525273"
                    value={bank.bik}
                    onChange={(e) => handleUpdateBank(bank.id, 'bik', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Наименование банка</Label>
                <Input 
                  placeholder="АО «ТелеПорт Банк» г. Москва"
                  value={bank.bankName}
                  onChange={(e) => handleUpdateBank(bank.id, 'bankName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Корр.счет</Label>
                <Input 
                  placeholder="30101810545250000273"
                  value={bank.corrAccount}
                  onChange={(e) => handleUpdateBank(bank.id, 'corrAccount', e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddBank}
            className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Icon name="Plus" size={20} />
            <span>Добавить банк</span>
          </button>
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

export default AddContractor;