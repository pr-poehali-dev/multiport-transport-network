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
import { FieldMapping, TemplateFile, TextItemData } from '@/components/template/types';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [file, setFile] = useState<File | null>(initialData?.file || null);
  const [templateName, setTemplateName] = useState(initialData?.fileName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(existingMappings);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [textItems, setTextItems] = useState<TextItemData[]>([]);

  const handleSelectionChange = (hasText: boolean) => {
    setHasSelection(hasText);
  };

  const handleAssignClick = () => {
    if (!hasSelection) return;
    setShowAssignMenu(true);
  };

  const handleAssignField = (formula: string, usedFields: string[]) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const width = rect.width;
    const height = rect.height;

    const fieldName = usedFields.length === 1 ? usedFields[0] : `formula_${Date.now()}`;

    const newMapping: FieldMapping = {
      id: `field_${Date.now()}`,
      fieldName,
      fieldLabel: formula,
      x: x / scale,
      y: y / scale,
      width: width / scale,
      height: height / scale,
      page: 0,
      fontSize: 12,
      fontFamily: 'Arial',
      text: formula,
      align: 'center',
      wordWrap: true,
    };

    setFieldMappings([...fieldMappings, newMapping]);
    setShowAssignMenu(false);
    setHasSelection(false);
    selection.removeAllRanges();

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
          ref={containerRef}
          file={file}
          scale={scale}
          fieldMappings={fieldMappings}
          onAssignClick={handleAssignClick}
          onTextItemsExtracted={setTextItems}
          onSelectionChange={handleSelectionChange}
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