import { useRef, useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import AddTemplate from './AddTemplate';
import { getTemplates, deleteTemplate, getTemplateById, Template } from '@/api/templates';
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

interface TemplatesProps {
  onMenuClick: () => void;
}

interface TemplateFile {
  file: File;
  pdfUrl: string;
  fileName: string;
}

function Templates({ onMenuClick }: TemplatesProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data.templates);
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
    setIsEditing(true);
  };

  const handleEditTemplate = async (template: Template) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleDeleteClick = (templateId: number) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const result = await deleteTemplate(templateToDelete);
      
      toast({
        title: 'Шаблон удалён',
        description: result.message || 'Шаблон успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadTemplates();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить шаблон'
      });
    }
  };

  if (isEditing) {
    return (
      <AddTemplate 
        onBack={() => {
          setIsEditing(false);
          setEditingTemplate(null);
          loadTemplates();
        }}
        onMenuClick={onMenuClick}
        editMode={!!editingTemplate}
        templateId={editingTemplate?.id}
        initialTemplateName={editingTemplate?.name || ''}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col">
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
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
            <p>Нажмите "+ Шаблон PDF" для загрузки</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-white rounded-lg border border-border hover:border-[#0ea5e9] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded">
                    <Icon name="FileText" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF-форма с заполняемыми полями
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteClick(template.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы действительно хотите удалить этот шаблон?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="X" size={16} />
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Templates;