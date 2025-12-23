import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import AddTemplate from './AddTemplate';

interface TemplatesProps {
  onMenuClick: () => void;
}

interface TemplateFile {
  file: File;
  pdfUrl: string;
  fileName: string;
}

function Templates({ onMenuClick }: TemplatesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(null);

  const handleRefresh = () => {
    console.log('Обновление шаблонов...');
  };

  const handleAddTemplate = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Можно загружать только PDF файлы'
      });
      return;
    }
    
    const url = URL.createObjectURL(file);
    const fileName = file.name.replace('.pdf', '');
    
    setSelectedFile({ file, pdfUrl: url, fileName });
    setIsEditing(true);
  };

  if (isEditing && selectedFile) {
    return (
      <AddTemplate 
        onBack={() => {
          setIsEditing(false);
          setSelectedFile(null);
        }}
        onMenuClick={onMenuClick}
        initialData={selectedFile}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
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
          <p>Нажмите "+ Шаблон PDF" для загрузки</p>
        </div>
      </div>
    </div>
  );
}

export default Templates;