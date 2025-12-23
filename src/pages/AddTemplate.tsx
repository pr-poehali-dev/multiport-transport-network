import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import FieldMappingsSidebar from '@/components/template/FieldMappingsSidebar';
import PdfViewer from '@/components/template/PdfViewer';
import FieldAssignDialog from '@/components/template/FieldAssignDialog';
import { FieldMapping, TemplateFile, TextItemData, DRIVER_FIELDS } from '@/components/template/types';

interface AddTemplateProps {
  onBack: () => void;
  onMenuClick: () => void;
  initialData?: TemplateFile;
  onSave?: (templateData: any) => void;
}

function AddTemplate({ onBack, onMenuClick, initialData }: AddTemplateProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [file, setFile] = useState<File | null>(initialData?.file || null);
  const [templateName, setTemplateName] = useState(initialData?.fileName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
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
          item.x < maxX &&
          item.x + item.width > minX &&
          item.y < maxY &&
          item.y + item.height > minY
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
    const originalText = selectedItems.map(item => item.text).join(' ');

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
      text: originalText,
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
      toast({
        title: 'Сохранение...',
        description: 'Шаблон сохраняется',
      });

      // Имитация сохранения - здесь будет вызов бэкенда
      await new Promise(resolve => setTimeout(resolve, 500));

      const templateData = {
        id: `template_${Date.now()}`,
        name: templateName,
        fileName: file.name,
        fieldMappings,
        createdAt: new Date().toISOString(),
      };

      // Сохраняем в localStorage временно
      const templates = JSON.parse(localStorage.getItem('pdf_templates') || '[]');
      templates.push(templateData);
      localStorage.setItem('pdf_templates', JSON.stringify(templates));

      toast({
        title: 'Успех!',
        description: `Шаблон "${templateName}" успешно сохранён`,
      });

      onBack();
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
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Новый шаблон"
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
            <AlertDialogTitle>Отменить создание?</AlertDialogTitle>
            <AlertDialogDescription>
              Все несохранённые изменения будут потеряны
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Отменить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddTemplate;