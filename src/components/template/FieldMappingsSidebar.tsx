import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { FieldMapping, TABLE_OPTIONS } from './types';

interface FieldMappingsSidebarProps {
  templateName: string;
  onTemplateNameChange: (value: string) => void;
  fieldMappings: FieldMapping[];
  onRemoveMapping: (id: string) => void;
  onAssignClick: () => void;
  hasSelection: boolean;
}

function FieldMappingsSidebar({
  templateName,
  onTemplateNameChange,
  fieldMappings,
  onRemoveMapping,
  onAssignClick,
  hasSelection,
}: FieldMappingsSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-border flex flex-col flex-shrink-0">
      <div className="p-4 lg:p-6 border-b border-border space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Название шаблона</Label>
          <Input
            id="template-name"
            placeholder="Введите название"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Назначено полей: {fieldMappings.length}
          </span>
          <Button
            onClick={onAssignClick}
            disabled={!hasSelection}
            size="sm"
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            <span className="hidden sm:inline">Назначить поле</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 lg:p-6">
        {fieldMappings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Поля не назначены</p>
            <p className="text-xs mt-1">Выделите текст на PDF для привязки</p>
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
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {mapping.fieldLabel}
                    </span>
                    {mapping.text && (
                      <span className="text-xs text-muted-foreground truncate block">
                        {mapping.text}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                  onClick={() => onRemoveMapping(mapping.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default FieldMappingsSidebar;