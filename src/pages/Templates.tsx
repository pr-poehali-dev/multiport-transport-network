import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';

interface TemplatesProps {
  onMenuClick: () => void;
}

function Templates({ onMenuClick }: TemplatesProps) {
  const handleRefresh = () => {
    console.log('Обновление шаблонов...');
  };

  const handleAddTemplate = () => {
    console.log('Добавление шаблона PDF...');
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Шаблоны"
        onMenuClick={onMenuClick}
        onRefresh={handleRefresh}
        rightButtons={
          <Button 
            onClick={handleAddTemplate}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
          >
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Шаблон PDF</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
          <p>Содержимое страницы шаблонов</p>
        </div>
      </div>
    </div>
  );
}

export default Templates;
