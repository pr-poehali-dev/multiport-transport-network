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
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { DRIVER_FIELDS } from './types';

interface FieldAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (formula: string, fields: string[]) => void;
}

function FieldAssignDialog({ open, onOpenChange, onAssign }: FieldAssignDialogProps) {
  const [formula, setFormula] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useState<HTMLInputElement | null>(null)[0];

  useEffect(() => {
    if (!open) {
      setFormula('');
      setCursorPosition(0);
    }
  }, [open]);

  const handleInsertField = (fieldValue: string) => {
    const field = DRIVER_FIELDS.find(f => f.value === fieldValue);
    if (!field) return;

    const fieldTag = `<${field.label}>`;
    const newFormula = formula.slice(0, cursorPosition) + fieldTag + formula.slice(cursorPosition);
    setFormula(newFormula);
    setCursorPosition(cursorPosition + fieldTag.length);
  };

  const handleAssign = () => {
    if (!formula.trim()) return;

    // Извлекаем все поля из формулы
    const fieldRegex = /<([^>]+)>/g;
    const matches = [...formula.matchAll(fieldRegex)];
    const usedFields = matches.map(match => {
      const label = match[1];
      const field = DRIVER_FIELDS.find(f => f.label === label);
      return field?.value || '';
    }).filter(Boolean);

    onAssign(formula, usedFields);
    setFormula('');
  };

  const handleCancel = () => {
    setFormula('');
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Назначить поле</AlertDialogTitle>
          <AlertDialogDescription>
            Выберите поля и добавьте текст между ними. Например: <code className="bg-slate-100 px-1 rounded">Водитель: &lt;Фамилия&gt; &lt;Имя&gt;</code>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Формула поля</label>
            <Input
              ref={(el) => {
                if (el) {
                  (inputRef as any) = el;
                }
              }}
              value={formula}
              onChange={handleInputChange}
              onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
              placeholder="Введите текст и вставьте поля"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Поля отображаются в угловых скобках. Вы можете добавлять любой текст между полями.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Вставить поле</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {DRIVER_FIELDS.map((field) => (
                <Button
                  key={field.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertField(field.value)}
                  className="justify-start text-left"
                >
                  <Icon name="Plus" size={14} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{field.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!formula.trim()}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            Назначить
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default FieldAssignDialog;
