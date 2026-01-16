import Icon from '@/components/ui/icon';
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

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: CancelConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={24} className="text-orange-500" />
            Подтверждение отмены
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="gap-2">
            <Icon name="ArrowLeft" size={16} />
            Продолжить редактирование
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            <Icon name="LogOut" size={16} />
            Выйти без сохранения
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
