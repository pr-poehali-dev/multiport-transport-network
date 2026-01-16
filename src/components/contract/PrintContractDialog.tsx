import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getTemplates, Template } from '@/api/templates';
import { useToast } from '@/hooks/use-toast';

interface PrintContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  contractNumber: string;
}

function PrintContractDialog({ 
  open, 
  onOpenChange, 
  contractId,
  contractNumber 
}: PrintContractDialogProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data.templates);
      
      if (data.templates.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Нет шаблонов',
          description: 'Сначала создайте шаблон в разделе "Шаблоны"'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список шаблонов'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedTemplate) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Выберите шаблон для печати'
      });
      return;
    }

    setIsPrinting(true);
    try {
      // TODO: Здесь будет вызов API для генерации PDF
      toast({
        title: 'Печать',
        description: `Генерация документа для договора ${contractNumber}...`
      });
      
      // Временно просто закрываем диалог
      setTimeout(() => {
        setIsPrinting(false);
        onOpenChange(false);
        setSelectedTemplate('');
      }, 1000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось сгенерировать документ'
      });
      setIsPrinting(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon name="Printer" size={24} className="text-[#0ea5e9]" />
            Печать договора-заявки
          </AlertDialogTitle>
          <AlertDialogDescription>
            Выберите шаблон для печати договора <span className="font-semibold">{contractNumber}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="mx-auto mb-2 animate-spin text-[#0ea5e9]" />
              <p className="text-sm text-muted-foreground">Загрузка шаблонов...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">Нет доступных шаблонов</p>
              <p className="text-xs text-muted-foreground mt-1">
                Создайте шаблон в разделе "Шаблоны"
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите шаблон</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шаблон" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id!.toString()}>
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={16} className="text-[#0ea5e9]" />
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Поля из договора будут автоматически подставлены в шаблон
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPrinting}>
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedTemplate || isPrinting || templates.length === 0}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            {isPrinting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="Printer" size={16} className="mr-2" />
                Печать
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PrintContractDialog;
