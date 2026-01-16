import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TABLE_OPTIONS } from './types';

interface FieldAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (formula: string, fields: string[]) => void;
}

function FieldAssignDialog({ open, onOpenChange, onAssign }: FieldAssignDialogProps) {
  const [formula, setFormula] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setFormula('');
      setCursorPosition(0);
      setSelectedTable('');
    }
  }, [open]);

  const currentTableFields = TABLE_OPTIONS.find(t => t.value === selectedTable)?.fields || [];

  const handleInsertField = (fieldValue: string) => {
    const field = currentTableFields.find(f => f.value === fieldValue);
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
      const field = currentTableFields.find(f => f.label === label);
      return field?.value || '';
    }).filter(Boolean);

    onAssign(formula, usedFields);
    setFormula('');
  };

  const handleCancel = () => {
    if (formula.trim()) {
      setShowCancelDialog(true);
    } else {
      setFormula('');
      onOpenChange(false);
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    setFormula('');
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  return (
    <>
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
                value={formula}
                onChange={handleInputChange}
                onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
                placeholder="Введите текст и вставьте теги полей"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Поля отображаются в угловых скобках. Вы можете добавлять любой текст между полями.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите таблицу</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите источник данных" />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_OPTIONS.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Доступные теги</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                  {currentTableFields.map((field) => (
                    <Badge
                      key={field.value}
                      variant="secondary"
                      className="cursor-pointer hover:bg-[#0ea5e9] hover:text-white transition-colors"
                      onClick={() => handleInsertField(field.value)}
                    >
                      <Icon name="Plus" size={12} className="mr-1" />
                      {field.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Нажмите на тег, чтобы вставить его в формулу
                </p>
              </div>
            )}
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
    </>
  );
}

export default FieldAssignDialog;