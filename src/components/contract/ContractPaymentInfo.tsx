import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface ContractPaymentInfoProps {
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  taxationType: string;
  setTaxationType: (value: string) => void;
  paymentTerms: string;
  setPaymentTerms: (value: string) => void;
}

export default function ContractPaymentInfo({
  paymentAmount,
  setPaymentAmount,
  taxationType,
  setTaxationType,
  paymentTerms,
  setPaymentTerms
}: ContractPaymentInfoProps) {
  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="DollarSign" size={20} className="text-[#0ea5e9]" />
        Финансовая информация
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentAmount">Сумма оплаты (₽)</Label>
          <Input
            id="paymentAmount"
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="50000.00"
          />
        </div>

        <div>
          <Label htmlFor="taxationType">Налогообложение</Label>
          <Input
            id="taxationType"
            value={taxationType}
            onChange={(e) => setTaxationType(e.target.value)}
            placeholder="НДС 20%, УСН 6%"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="paymentTerms">Условия оплаты</Label>
        <Textarea
          id="paymentTerms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Оплата в течение 5 рабочих дней после доставки груза..."
          rows={3}
        />
      </div>
    </div>
  );
}
