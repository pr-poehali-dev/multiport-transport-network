import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
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

const AddTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (location.state) {
      const { file: stateFile, pdfUrl, fileName } = location.state as { 
        file: File; 
        pdfUrl: string; 
        fileName: string; 
      };
      
      setFile(stateFile);
      setPdfPreviewUrl(pdfUrl);
      setTemplateName(fileName);
    }
  }, [location.state]);

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

  const handleUpload = async () => {
    if (!file || !templateName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и выберите файл',
        variant: 'destructive',
      });
      return;
    }

    if (fieldMappings.length === 0) {
      toast({
        title: 'Предупреждение',
        description: 'Вы не назначили ни одного поля. Продолжить?',
        variant: 'destructive',
      });
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
          description: `Шаблон "${templateName}" успешно загружен`,
        });

        navigate('/');
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

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">Редактор PDF шаблона</h1>
            <p className="text-sm lg:text-base text-slate-600">Назначьте поля на элементы документа</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <Icon name="X" className="mr-2 h-4 w-4" />
            Закрыть
          </Button>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-4 lg:gap-6">
          {/* Левая панель - Настройки */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Настройки шаблона</CardTitle>
                <CardDescription>Основная информация</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Название шаблона</Label>
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
                    {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Назначенные поля
                  <Badge variant="secondary">{fieldMappings.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Кликните по PDF и выберите поле
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {fieldMappings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="MousePointerClick" size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Поля не назначены</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fieldMappings.map((mapping) => (
                        <div
                          key={mapping.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon name="Link" size={16} className="text-blue-500 flex-shrink-0" />
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
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || !templateName.trim() || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Save" className="mr-2 h-4 w-4" />
                    Сохранить шаблон
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                size="lg"
                className="w-full"
              >
                Отмена
              </Button>
            </div>
          </div>

          {/* Правая панель - PDF Viewer */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Предпросмотр документа</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAssignMenu(true)}
                >
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Назначить поле
                </Button>
              </div>
              <CardDescription>
                Кликните на документ, чтобы назначить поле для данных
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pdfPreviewUrl ? (
                <div className="relative bg-slate-100">
                  <div 
                    className="cursor-crosshair"
                    onClick={handlePdfClick}
                  >
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-[calc(100vh-250px)] min-h-[600px]"
                      title="PDF Preview"
                    />
                  </div>
                  
                  {/* Overlay для назначенных полей */}
                  {fieldMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="absolute bg-blue-500/20 border-2 border-blue-500 rounded"
                      style={{
                        left: mapping.x,
                        top: mapping.y,
                        width: 120,
                        height: 24,
                      }}
                    >
                      <div className="text-xs font-medium text-blue-700 px-1 truncate">
                        {mapping.fieldLabel}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center bg-slate-50">
                  <div className="text-center text-muted-foreground">
                    <Icon name="FileText" size={64} className="mx-auto mb-4 opacity-20" />
                    <p>PDF не загружен</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Меню назначения поля */}
      {showAssignMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Назначить поле</CardTitle>
              <CardDescription>
                Выберите поле из справочника водителей
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="flex-1"
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddTemplate;
