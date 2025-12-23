import { useRef, useState, useEffect } from 'react';
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
  const [templates, setTemplates] = useState<any[]>([]);

  const loadTemplates = () => {
    const saved = JSON.parse(localStorage.getItem('pdf_templates') || '[]');
    setTemplates(saved);
  };

  const handleRefresh = () => {
    loadTemplates();
    toast({
      title: 'Обновлено',
      description: 'Список шаблонов обновлен',
    });
  };

  useEffect(() => {
    loadTemplates();
  }, []);

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
          loadTemplates();
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
        {templates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
            <p>Нажмите "+ Шаблон PDF" для загрузки</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-white rounded-lg border border-border hover:border-[#0ea5e9] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded">
                    <Icon name="FileText" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.fieldMappings.length} полей назначено
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Templates;