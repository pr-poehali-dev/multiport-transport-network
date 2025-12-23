import { useState } from 'react';
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
import { DRIVER_FIELDS } from './types';

interface FieldAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (fieldValue: string) => void;
}

function FieldAssignDialog({ open, onOpenChange, onAssign }: FieldAssignDialogProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedField) {
      onAssign(selectedField);
      setSelectedField(null);
    }
  };

  const handleCancel = () => {
    setSelectedField(null);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Назначить поле</AlertDialogTitle>
          <AlertDialogDescription>
            Выберите поле для привязки к выделенной области
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Select value={selectedField || ''} onValueChange={setSelectedField}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите поле" />
            </SelectTrigger>
            <SelectContent>
              {DRIVER_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedField}
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
