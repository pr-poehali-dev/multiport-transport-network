import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    </>
  );
}

export default BankAccountsSection;
