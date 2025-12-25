import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';

interface AddOrdersProps {
  onBack: () => void;
  onMenuClick: () => void;
}

function AddOrders({ onBack, onMenuClick }: AddOrdersProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title="Добавить заказ"
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6">
            <p className="text-muted-foreground text-center">
              Форма добавления заказа будет здесь
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddOrders;
