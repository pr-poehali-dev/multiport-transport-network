import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import AddDriver from './AddDriver';

interface DriversProps {
  onMenuClick: () => void;
}

function Drivers({ onMenuClick }: DriversProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding) {
    return <AddDriver onBack={() => setIsAdding(false)} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Icon name="Menu" size={24} />
            </Button>
            <h1 className="text-lg lg:text-xl font-semibold text-foreground">Водители</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
              <Icon name="RefreshCw" size={18} />
              <span className="hidden sm:inline">Обновить</span>
            </Button>
            <Button 
              onClick={() => setIsAdding(true)}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              <Icon name="Plus" size={18} />
              <span className="hidden sm:inline">Добавить</span>
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