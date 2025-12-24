import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import FieldMappingsSidebar from '@/components/template/FieldMappingsSidebar';
import PdfViewer from '@/components/template/PdfViewer';
import FieldAssignDialog from '@/components/template/FieldAssignDialog';
import { FieldMapping, TemplateFile, TextItemData, DRIVER_FIELDS } from '@/components/template/types';

interface AddTemplateProps {
  onBack: () => void;
  onMenuClick: () => void;
  initialData?: TemplateFile;
  onSave?: (templateData: any) => void;
  editMode?: boolean;
  templateId?: number;
  existingMappings?: FieldMapping[];
}

function AddTemplate({ onBack, onMenuClick, initialData, editMode = false, templateId, existingMappings = [] }: AddTemplateProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [file, setFile] = useState<File | null>(initialData?.file || null);
  const [templateName, setTemplateName] = useState(initialData?.fileName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(existingMappings);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [textItems, setTextItems] = useState<TextItemData[]>([]);
  const [selectedTextItems, setSelectedTextItems] = useState<number[]>([]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
    setHasSelection(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setSelectionEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      
      // Находим все текстовые элементы в выделенной области
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      const selected: number[] = [];
      textItems.forEach((item, index) => {
        // Проверяем пересечение с выделенной областью
        if (
          item.x < maxX / scale &&
          item.x + item.width > minX / scale &&
          item.y < maxY / scale &&
          item.y + item.height > minY / scale
        ) {
          selected.push(index);
        }
      });
      
      if (selected.length > 0) {
        setSelectedTextItems(selected);
        setHasSelection(true);
      }
    }
  };

  const handleAssignClick = () => {
    if (!hasSelection) return;
    setShowAssignMenu(true);
  };

  const handleAssignField = (formula: string, usedFields: string[]) => {
    if (selectedTextItems.length === 0) return;

    // Получаем границы выделенных текстовых элементов
    const selectedItems = selectedTextItems.map(i => textItems[i]);
    const minX = Math.min(...selectedItems.map(item => item.x));
    const minY = Math.min(...selectedItems.map(item => item.y));
    const maxX = Math.max(...selectedItems.map(item => item.x + item.width));
    const maxY = Math.max(...selectedItems.map(item => item.y + item.height));
    
    // Берем размер шрифта первого выделенного элемента
    const firstItem = selectedItems[0];

    // Используем формулу в качестве fieldName для множественных полей
    const fieldName = usedFields.length === 1 ? usedFields[0] : `formula_${Date.now()}`;

    const newMapping: FieldMapping = {
      id: `field_${Date.now()}`,
      fieldName,
      fieldLabel: formula,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      page: 0,
      fontSize: firstItem.fontSize,
      fontFamily: firstItem.fontFamily,
      text: formula,
    };

    setFieldMappings([...fieldMappings, newMapping]);
    setShowAssignMenu(false);
    setHasSelection(false);
    setSelectedTextItems([]);

    toast({
      title: 'Поле назначено',
      description: `Формула добавлена в шаблон`,
    });
  };

  const handleRemoveMapping = (id: string) => {
    setFieldMappings(fieldMappings.filter(m => m.id !== id));
    toast({
      title: 'Поле удалено',
      description: 'Привязка поля удалена из шаблона',
    });
  };

  const handleFieldMappingUpdate = (id: string, updates: Partial<FieldMapping>) => {
    setFieldMappings(fieldMappings.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
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
      // Режим редактирования - только обновляем маппинги, не загружаем файл заново
      if (editMode && templateId) {
        const data = await updateTemplate(templateId, {
          name: templateName,
          fileName: file.name,
          fieldMappings,
        });

        toast({
          title: 'Успех!',
          description: data.message || `Шаблон "${templateName}" обновлён`,
        });

        onBack();
        return;
      }

      // Режим создания - читаем PDF как base64
      const reader = new FileReader();
      const fileDataBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Убираем "data:application/pdf;base64," префикс
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
        fieldMappings,
      });

      toast({
        title: 'Успех!',
        description: data.message || `Шаблон "${templateName}" успешно сохранён`,
      });

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

      <div className="flex-1 flex flex-row overflow-hidden">
        <FieldMappingsSidebar
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          fieldMappings={fieldMappings}
          onRemoveMapping={handleRemoveMapping}
          onAssignClick={handleAssignClick}
          hasSelection={hasSelection}
        />

        <PdfViewer
          ref={canvasRef}
          file={file}
          scale={scale}
          fieldMappings={fieldMappings}
          isSelecting={isSelecting}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          hasSelection={hasSelection}
          selectedTextItems={selectedTextItems}
          textItems={textItems}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onAssignClick={handleAssignClick}
          onTextItemsExtracted={setTextItems}
          onFieldMappingUpdate={handleFieldMappingUpdate}
        />
      </div>

      <FieldAssignDialog
        open={showAssignMenu}
        onOpenChange={setShowAssignMenu}
        onAssign={handleAssignField}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Данное действие приведет к потере всех введенных данных.
              Вы уверены, что хотите выйти без сохранения?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="LogOut" size={16} />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddTemplate;