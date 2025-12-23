import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

function Drivers() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Водители</h1>
          <div className="flex items-center gap-3">
            <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
              <Icon name="RefreshCw" size={18} />
              Обновить
            </Button>
            <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
              <Icon name="Plus" size={18} />
              Добавить
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-auto">
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="UserCircle" size={48} className="mx-auto mb-4 opacity-20" />
          <p>Содержимое страницы водителей</p>
        </div>
      </div>
    </div>
  );
}

export default Drivers;