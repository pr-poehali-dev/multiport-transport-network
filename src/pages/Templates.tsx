import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';

interface TemplatesProps {
  onMenuClick: () => void;
}

function Templates({ onMenuClick }: TemplatesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPdfPreviewUrl(url);
    setTemplateName(file.name.replace('.pdf', ''));
    setShowDialog(true);
    console.log('Выбран файл:', file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните название шаблона'
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1];

        // TODO: Подставить реальный URL backend функции
        const response = await fetch('YOUR_BACKEND_URL_HERE', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            type: 'pdf',
            pdf_content: base64Content,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки');
        }

        toast({
          title: 'Успех!',
          description: `Шаблон "${templateName}" загружен`,
        });

        setShowDialog(false);
        setSelectedFile(null);
        setPdfPreviewUrl(null);
        setTemplateName('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить шаблон',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setSelectedFile(null);
    setPdfPreviewUrl(null);
    setTemplateName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Добавить PDF шаблон</DialogTitle>
            <DialogDescription>
              Укажите название и проверьте содержимое
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название шаблона</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Договор перевозки"
                />
              </div>

              <div className="space-y-2">
                <Label>Файл</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpload} 
                  disabled={!templateName.trim() || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" className="mr-2 h-4 w-4" />
                      Загрузить
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDialogClose}
                  disabled={isUploading}
                >
                  Отмена
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white flex flex-col">
              <div className="bg-slate-100 px-3 py-2 text-sm font-medium border-b">
                Предпросмотр PDF
              </div>
              {pdfPreviewUrl && (
                <iframe
                  src={pdfPreviewUrl}
                  className="flex-1 w-full min-h-[400px]"
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Templates;