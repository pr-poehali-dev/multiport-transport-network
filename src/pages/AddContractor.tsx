import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
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
import BasicInfoSection from '@/components/contractor/BasicInfoSection';
import AddressesSection from '@/components/contractor/AddressesSection';
import BankAccountsSection from '@/components/contractor/BankAccountsSection';

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
      const API_URL = 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a';
      
      const contractorData = {
        name,
        inn,
        kpp: kpp || null,
        ogrn: ogrn || null,
        director: director || null,
        legalAddress: legalAddress || null,
        actualAddress: actualAddress || null,
        postalAddress: postalAddress || null,
        isSeller,
        isBuyer,
        isCarrier,
        bankAccounts: bankAccounts.map(acc => ({
          accountNumber: acc.accountNumber,
          bik: acc.bik,
          bankName: acc.bankName,
          corrAccount: acc.corrAccount
        })),
        deliveryAddresses: deliveryAddresses.map(addr => ({
          address: addr.address,
          phone: addr.phone,
          contact: addr.contact
        }))
      };

      if (isEditMode && contractor) {
        const response = await fetch(`${API_URL}?resource=contractors&id=${contractor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractorData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка при обновлении контрагента');
        }
      } else {
        const response = await fetch(`${API_URL}?resource=contractors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractorData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка при создании контрагента');
        }
      }

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
          <BasicInfoSection
            name={name}
            setName={setName}
            isSeller={isSeller}
            setIsSeller={setIsSeller}
            isBuyer={isBuyer}
            setIsBuyer={setIsBuyer}
            isCarrier={isCarrier}
            setIsCarrier={setIsCarrier}
            inn={inn}
            setInn={setInn}
            kpp={kpp}
            setKpp={setKpp}
            ogrn={ogrn}
            setOgrn={setOgrn}
            director={director}
            setDirector={setDirector}
          />

          <AddressesSection
            legalAddress={legalAddress}
            setLegalAddress={setLegalAddress}
            showActualAddress={showActualAddress}
            setShowActualAddress={setShowActualAddress}
            actualAddress={actualAddress}
            setActualAddress={setActualAddress}
            actualSameAsLegal={actualSameAsLegal}
            setActualSameAsLegal={setActualSameAsLegal}
            showPostalAddress={showPostalAddress}
            setShowPostalAddress={setShowPostalAddress}
            postalAddress={postalAddress}
            setPostalAddress={setPostalAddress}
            postalSameAsLegal={postalSameAsLegal}
            setPostalSameAsLegal={setPostalSameAsLegal}
            deliveryAddresses={deliveryAddresses}
            handleAddDeliveryAddress={handleAddDeliveryAddress}
            handleRemoveDeliveryAddress={handleRemoveDeliveryAddress}
            handleUpdateDeliveryAddress={handleUpdateDeliveryAddress}
          />

          <BankAccountsSection
            bankAccounts={bankAccounts}
            handleAddBank={handleAddBank}
            handleRemoveBank={handleRemoveBank}
            handleUpdateBank={handleUpdateBank}
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

export default AddContractor;