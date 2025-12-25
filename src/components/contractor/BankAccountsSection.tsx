import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface BankAccount {
  id: string;
  accountNumber: string;
  bik: string;
  bankName: string;
  corrAccount: string;
}

interface BankAccountsSectionProps {
  bankAccounts: BankAccount[];
  handleAddBank: () => void;
  handleRemoveBank: (id: string) => void;
  handleUpdateBank: (id: string, field: keyof BankAccount, value: string) => void;
}

function BankAccountsSection({
  bankAccounts,
  handleAddBank,
  handleRemoveBank,
  handleUpdateBank
}: BankAccountsSectionProps) {
  const { toast } = useToast();
  const [loadingBikMap, setLoadingBikMap] = useState<Record<string, boolean>>({});

  const fetchBankByBik = async (bikValue: string, bankId: string) => {
    const cleanBik = bikValue.replace(/\D/g, '');
    
    if (cleanBik.length !== 9) {
      return;
    }

    setLoadingBikMap(prev => ({ ...prev, [bankId]: true }));

    try {
      const API_URL = 'https://functions.poehali.dev/bbe9b092-03c0-40af-8e4c-bbf9dbde445a';
      const response = await fetch(`${API_URL}?resource=dadata&bik=${cleanBik}`);
      
      if (response.ok) {
        const data = await response.json();
        
        handleUpdateBank(bankId, 'bankName', data.bankName || '');
        handleUpdateBank(bankId, 'corrAccount', data.corrAccount || '');
        
        toast({
          title: 'Данные банка загружены',
          description: 'Реквизиты банка успешно заполнены из DaData'
        });
      } else if (response.status === 404) {
        toast({
          variant: 'destructive',
          title: 'Банк не найден',
          description: 'По указанному БИК не найдена информация'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных банка DaData:', error);
    } finally {
      setLoadingBikMap(prev => ({ ...prev, [bankId]: false }));
    }
  };

  const handleBikBlur = (bankId: string, bikValue: string) => {
    if (bikValue.replace(/\D/g, '').length === 9) {
      fetchBankByBik(bikValue, bankId);
    }
  };

  return (
    <>
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
              <div className="relative">
                <Input 
                  placeholder="044525273"
                  value={bank.bik}
                  onChange={(e) => handleUpdateBank(bank.id, 'bik', e.target.value)}
                  onBlur={(e) => handleBikBlur(bank.id, e.target.value)}
                />
                {loadingBikMap[bank.id] && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="Loader2" size={18} className="animate-spin text-[#0ea5e9]" />
                  </div>
                )}
              </div>
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
    </>
  );
}

export default BankAccountsSection;