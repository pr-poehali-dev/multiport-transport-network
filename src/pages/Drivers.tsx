import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import AddDriver from './AddDriver';

interface DriversProps {
  onMenuClick: () => void;
}

function Drivers({ onMenuClick }: DriversProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleRefresh = () => {
    console.log('Обновление списка водителей...');
  };

  if (isAdding) {
    return <AddDriver onBack={() => setIsAdding(false)} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Водители"
        onMenuClick={onMenuClick}
        onRefresh={handleRefresh}
        rightButtons={
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
          >
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        }
      />

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