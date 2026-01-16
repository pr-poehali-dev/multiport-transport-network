import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface OrderActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isEditMode: boolean;
}

export default function OrderActions({ onCancel, onSave, isEditMode }: OrderActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onCancel} className="flex-1">
        <Icon name="X" size={18} className="mr-2" />
        Отменить
      </Button>
      <Button onClick={onSave} className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
        <Icon name="Save" size={18} className="mr-2" />
        {isEditMode ? 'Обновить заказ' : 'Сохранить заказ в БД'}
      </Button>
    </div>
  );
}
