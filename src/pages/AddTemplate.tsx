import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { createTemplate, updateTemplate } from '@/api/templates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddTemplateProps {
  onBack: () => void;
  onMenuClick: () => void;
  editMode?: boolean;
  templateId?: number;
  initialTemplateName?: string;
}

function AddTemplate({ 
  onBack, 
  onMenuClick, 
  editMode = false, 
  templateId,
  initialTemplateName = ''
}: AddTemplateProps) {
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      if (!templateName) {
        setTemplateName(uploadedFile.name.replace('.pdf', ''));
      }
    } else {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите PDF файл',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (file || templateName !== initialTemplateName) {
      setShowCancelDialog(true);
    } else {
      onBack();
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите название шаблона',
        variant: 'destructive',
      });
      return;
    }

    if (!file && !editMode) {
      toast({
        title: 'Ошибка',
        description: 'Загрузите PDF-файл',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      if (editMode && templateId) {
        // Режим редактирования - только имя
        const data = await updateTemplate(templateId, {
          name: templateName,
          fileName: file?.name || '',
          fieldMappings: [],
        });

        toast({
          title: 'Успех!',
          description: data.message || `Шаблон "${templateName}" обновлён`,
        });
      } else {
        // Режим создания - читаем PDF
        if (!file) return;

        const reader = new FileReader();
        const fileDataBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const data = await createTemplate({
          name: templateName,
          fileName: file.name,
          fileData: fileDataBase64,
          fieldMappings: [],
        });

        toast({
          title: 'Успех!',
          description: data.message || `Шаблон "${templateName}" сохранён`,
        });
      }

      onBack();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить шаблон',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title={editMode ? "Редактировать шаблон" : "Новый шаблон"}
        showBackButton
        onBack={handleCancel}
        onMenuClick={onMenuClick}
        rightButtons={
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отмена</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUploading}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Название */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Название шаблона
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Договор-заявка"
              className="text-base"
            />
          </div>

          {/* Загрузка файла */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-slate-50">
            {file ? (
              <div>
                <Icon name="FileCheck" size={64} className="mx-auto mb-4 text-green-600" />
                <p className="font-medium text-lg mb-1">{file.name}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {(file.size / 1024).toFixed(1)} КБ
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFile(null)} 
                  className="gap-2"
                >
                  <Icon name="Trash2" size={16} />
                  Выбрать другой файл
                </Button>
              </div>
            ) : (
              <div>
                <Icon name="Upload" size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">
                  {editMode ? 'Заменить PDF-форму' : 'Загрузите PDF-форму'}
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Файл должен содержать поля формы с названиями: customer_name, contract_number, cargo и т.д.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild className="gap-2">
                    <span>
                      <Icon name="FileUp" size={18} />
                      Выбрать PDF файл
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Инструкция */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
              <Icon name="Info" size={20} />
              Как создать PDF-форму
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-2">В LibreOffice Writer (бесплатно):</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Создайте договор как обычно</li>
                  <li>Вставка → Поле → Другие поля → Функции → Поле ввода</li>
                  <li>Назовите поля: customer_name, contract_number и т.д.</li>
                  <li>Файл → Экспорт в PDF → ✓ Создать PDF-форму</li>
                </ol>
              </div>
              
              <div>
                <p className="font-medium mb-2">Доступные поля формы:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  <code className="text-xs">customer_name</code>
                  <code className="text-xs">carrier_name</code>
                  <code className="text-xs">contract_number</code>
                  <code className="text-xs">contract_date</code>
                  <code className="text-xs">cargo</code>
                  <code className="text-xs">loading_addresses</code>
                  <code className="text-xs">unloading_addresses</code>
                  <code className="text-xs">payment_amount</code>
                  <code className="text-xs">driver_full_name</code>
                  <code className="text-xs">vehicle_registration_number</code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ...и другие из договора
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы уверены, что хотите выйти? Несохранённые изменения будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddTemplate;
