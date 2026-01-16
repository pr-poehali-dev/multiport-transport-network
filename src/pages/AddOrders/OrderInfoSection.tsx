import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Contractor } from '@/api/contractors';
import { Consignee } from './types';

interface OrderInfoSectionProps {
  prefix: string;
  setPrefix: (value: string) => void;
  orderDate: string;
  setOrderDate: (value: string) => void;
  routeNumber: string;
  setRouteNumber: (value: string) => void;
  invoice: string;
  setInvoice: (value: string) => void;
  trak: string;
  setTrak: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  fullRoute: string;
  consignees: Consignee[];
  contractors: Contractor[];
  isOrderLocked: boolean;
  searchConsignee: Record<string, string>;
  setSearchConsignee: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showConsigneeList: Record<string, boolean>;
  setShowConsigneeList: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  loadingContractors: boolean;
  onUpdateConsignee: (id: string, field: 'name' | 'note' | 'contractorId', value: string | number | undefined) => void;
  onRemoveConsignee: (id: string) => void;
  onAddConsignee: () => void;
  onSaveOrder: () => void;
  onGenerateRouteNumber: () => string;
}

export default function OrderInfoSection({
  prefix,
  setPrefix,
  orderDate,
  setOrderDate,
  routeNumber,
  invoice,
  setInvoice,
  trak,
  setTrak,
  weight,
  setWeight,
  fullRoute,
  consignees,
  contractors,
  isOrderLocked,
  searchConsignee,
  setSearchConsignee,
  showConsigneeList,
  setShowConsigneeList,
  loadingContractors,
  onUpdateConsignee,
  onRemoveConsignee,
  onAddConsignee,
  onSaveOrder,
}: OrderInfoSectionProps) {
  const getFilteredContractors = (consigneeId: string) => {
    const query = (searchConsignee[consigneeId] || '').toLowerCase();
    if (!query) return contractors;
    return contractors.filter(c => 
      c.name.toLowerCase().includes(query) ||
      (c.inn && c.inn.includes(query))
    );
  };

  const handleSelectConsignee = (consigneeId: string, contractor: Contractor) => {
    onUpdateConsignee(consigneeId, 'name', contractor.name);
    onUpdateConsignee(consigneeId, 'contractorId', contractor.id);
    setSearchConsignee(prev => ({ ...prev, [consigneeId]: contractor.name }));
    setShowConsigneeList(prev => ({ ...prev, [consigneeId]: false }));
  };
  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Package" size={20} className="text-[#0ea5e9]" />
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Заказ</h2>
      </div>

      <div className="space-y-2">
        <Label>Маршрут</Label>
        <Input
          value={fullRoute}
          readOnly
          placeholder="Маршрут будет составлен из точек ниже"
          className="bg-gray-50"
          disabled={isOrderLocked}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Префикс</Label>
          <Select value={prefix} onValueChange={setPrefix} disabled={isOrderLocked}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EU">EU</SelectItem>
              <SelectItem value="CH">CH</SelectItem>
              <SelectItem value="RF">RF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Дата заказа</Label>
          <Input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            disabled={isOrderLocked}
          />
        </div>

        <div className="space-y-2">
          <Label>Номер маршрута</Label>
          <Input
            value={routeNumber}
            readOnly
            className="bg-gray-50"
            disabled={isOrderLocked}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Инвойс</Label>
          <Input
            placeholder="Введите номер инвойса"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            disabled={isOrderLocked}
          />
        </div>

        <div className="space-y-2">
          <Label>TRAK</Label>
          <Input
            placeholder="Введите TRAK"
            value={trak}
            onChange={(e) => setTrak(e.target.value)}
            disabled={isOrderLocked}
          />
        </div>

        <div className="space-y-2">
          <Label>Вес (кг)</Label>
          <Input
            type="number"
            placeholder="Вес груза"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={isOrderLocked}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Грузополучатели</Label>
        {consignees.map((consignee, index) => (
          <div key={consignee.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  data-consignee-id={consignee.id}
                  placeholder={`Грузополучатель ${index + 1}`}
                  value={searchConsignee[consignee.id] || consignee.name}
                  onChange={(e) => {
                    setSearchConsignee(prev => ({ ...prev, [consignee.id]: e.target.value }));
                    onUpdateConsignee(consignee.id, 'name', e.target.value);
                    setShowConsigneeList(prev => ({ ...prev, [consignee.id]: true }));
                  }}
                  onFocus={() => setShowConsigneeList(prev => ({ ...prev, [consignee.id]: true }))}
                  disabled={isOrderLocked}
                />
                {showConsigneeList[consignee.id] && !isOrderLocked && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingContractors ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">Загрузка...</div>
                    ) : getFilteredContractors(consignee.id).length > 0 ? (
                      getFilteredContractors(consignee.id).map((contractor) => (
                        <button
                          key={contractor.id}
                          onClick={() => handleSelectConsignee(consignee.id, contractor)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="font-medium text-sm">{contractor.name}</div>
                          {contractor.inn && (
                            <div className="text-xs text-muted-foreground">ИНН: {contractor.inn}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground text-center">Контрагенты не найдены</div>
                    )}
                  </div>
                )}
              </div>
              <Input
                placeholder="Примечание"
                value={consignee.note}
                onChange={(e) => onUpdateConsignee(consignee.id, 'note', e.target.value)}
                disabled={isOrderLocked}
              />
            </div>
            {consignees.length > 1 && !isOrderLocked && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveConsignee(consignee.id)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="Trash2" size={18} />
              </Button>
            )}
          </div>
        ))}
        {!isOrderLocked && (
          <button
            onClick={onAddConsignee}
            className="w-full border border-dashed border-border rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icon name="Plus" size={16} />
            <span>Добавить грузополучателя</span>
          </button>
        )}
      </div>

      {!isOrderLocked && (
        <Button
          onClick={onSaveOrder}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Icon name="Save" size={18} />
          <span>Сохранить заказ</span>
        </Button>
      )}

      {isOrderLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
          <Icon name="CheckCircle" size={18} />
          <span>Заказ сохранен</span>
        </div>
      )}
    </div>
  );
}