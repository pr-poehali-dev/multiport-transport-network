import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldMapping {
  id: string;
  fieldName: string;
  fieldLabel: string;
  x: number;
  y: number;
  page: number;
  originalText: string;
}

const DRIVER_FIELDS = [
  { value: 'lastName', label: 'Фамилия' },
  { value: 'firstName', label: 'Имя' },
  { value: 'middleName', label: 'Отчество' },
  { value: 'phone', label: 'Телефон 1' },
  { value: 'phoneExtra', label: 'Телефон 2' },
  { value: 'passportSeries', label: 'Паспорт: Серия' },
  { value: 'passportNumber', label: 'Паспорт: Номер' },
  { value: 'passportDate', label: 'Паспорт: Дата выдачи' },
  { value: 'passportIssued', label: 'Паспорт: Кем выдан' },
  { value: 'licenseSeries', label: 'ВУ: Серия' },
  { value: 'licenseNumber', label: 'ВУ: Номер' },
  { value: 'licenseDate', label: 'ВУ: Дата выдачи' },
  { value: 'licenseIssued', label: 'ВУ: Кем выдан' },
];

interface TemplateFile {
  file: File;
  pdfUrl: string;
  fileName: string;
}

interface AddTemplateProps {
  onBack: () => void;
  onMenuClick: () => void;
  initialData?: TemplateFile;
}

function AddTemplate({ onBack, onMenuClick, initialData }: AddTemplateProps) {
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(initialData?.file || null);
  const [templateName, setTemplateName] = useState(initialData?.fileName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(initialData?.pdfUrl || null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handlePdfClick = (event: React.MouseEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget;
    const rect = iframe.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setClickPosition({ x, y });
    setShowAssignMenu(true);
  };

  const handleAssignField = (fieldValue: string) => {
    const field = DRIVER_FIELDS.find(f => f.value === fieldValue);
    if (!field) return;

    const newMapping: FieldMapping = {
      id: `field_${Date.now()}`,
      fieldName: field.value,
      fieldLabel: field.label,
      x: clickPosition.x,
      y: clickPosition.y,
      page: 0,
      originalText: '',
    };

    setFieldMappings([...fieldMappings, newMapping]);
    setShowAssignMenu(false);
    setSelectedField(null);

    toast({
      title: 'Поле назначено',
      description: `"${field.label}" добавлено в шаблон`,
    });
  };

  const handleRemoveMapping = (id: string) => {
    setFieldMappings(fieldMappings.filter(m => m.id !== id));
    toast({
      title: 'Поле удалено',
      description: 'Привязка поля удалена из шаблона',
    });
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!file || !templateName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название шаблона',
        variant: 'destructive',
      });
      return;
    }

    if (fieldMappings.length === 0) {
      toast({
        title: 'Предупреждение',
        description: 'Вы не назначили ни одного поля',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1];

        const response = await fetch('YOUR_BACKEND_URL_HERE', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            type: 'pdf',
            pdf_content: base64Content,
            field_mappings: fieldMappings,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки шаблона');
        }

        toast({
          title: 'Успех!',
          description: `Шаблон "${templateName}" успешно сохранён`,
        });

        onBack();
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить шаблон',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title="Редактор шаблона"
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUploading}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" className="animate-spin" size={18} />
                  <span className="hidden sm:inline">Загрузка...</span>
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель - Настройки */}
        <div className="w-64 border-r border-border bg-white flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Settings" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Настройки</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Название шаблона *</Label>
                <Input
                  id="templateName"
                  placeholder="Договор перевозки"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Файл</Label>
                <div className="text-sm text-muted-foreground">
                  {file?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((file?.size || 0) / 1024).toFixed(1)} КБ
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="Link" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">
                    Назначенные поля
                  </h2>
                </div>
                <Badge variant="secondary">{fieldMappings.length}</Badge>
              </div>
              
              <Button
                onClick={() => setShowAssignMenu(true)}
                className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
              >
                <Icon name="Plus" size={18} />
                <span className="hidden sm:inline">Назначить поле</span>
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4 lg:p-6">
              {fieldMappings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Поля не назначены</p>
                  <p className="text-xs mt-1">Кликните на PDF для привязки</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fieldMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon name="Link" size={16} className="text-[#0ea5e9] flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {mapping.fieldLabel}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                        onClick={() => handleRemoveMapping(mapping.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Правая панель - PDF Viewer */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 lg:p-6">
            {pdfPreviewUrl ? (
              <div className="bg-white rounded-lg border border-border overflow-hidden relative">
                <div 
                  className="cursor-crosshair"
                  onClick={handlePdfClick}
                >
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=0`}
                    className="w-full h-[calc(100vh-200px)] min-h-[600px]"
                    title="PDF Preview"
                  />
                </div>
                
                {fieldMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="absolute bg-[#0ea5e9]/20 border-2 border-[#0ea5e9] rounded"
                    style={{
                      left: mapping.x,
                      top: mapping.y,
                      width: 120,
                      height: 24,
                    }}
                  >
                    <div className="text-xs font-medium text-[#0ea5e9] px-1 truncate">
                      {mapping.fieldLabel}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border p-20 text-center">
                <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">PDF не загружен</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно назначения поля */}
      {showAssignMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-border max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Назначить поле</h3>
              <p className="text-sm text-muted-foreground">
                Выберите поле из справочника водителей
              </p>
            </div>

            <Select value={selectedField || ''} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите поле..." />
              </SelectTrigger>
              <SelectContent>
                {DRIVER_FIELDS.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={() => selectedField && handleAssignField(selectedField)}
                disabled={!selectedField}
                className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
              >
                <Icon name="Check" className="mr-2 h-4 w-4" />
                Назначить
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignMenu(false);
                  setSelectedField(null);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AlertDialog для подтверждения отмены */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Данное действие приведет к потере всех настроек шаблона.
              Вы уверены, что хотите выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddTemplate;