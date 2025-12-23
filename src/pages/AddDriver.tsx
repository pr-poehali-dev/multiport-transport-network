import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AddDriverProps {
  onBack: () => void;
}

function AddDriver({ onBack }: AddDriverProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-gray-100"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Добавить водителя</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              Отменить
            </Button>
            <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
              <Icon name="Check" size={18} />
              Сохранить
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input id="lastName" placeholder="Иванов" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input id="firstName" placeholder="Иван" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input id="middleName" placeholder="Иванович" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input id="phone" placeholder="+7 (999) 123-45-67" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Номер водительского удостоверения *</Label>
              <Input id="licenseNumber" placeholder="1234 567890" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseDate">Дата выдачи ВУ *</Label>
                <Input id="licenseDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">Срок действия ВУ *</Label>
                <Input id="licenseExpiry" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categories">Категории ВУ *</Label>
              <Input id="categories" placeholder="B, C, CE" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport">Паспортные данные</Label>
              <Input id="passport" placeholder="1234 567890" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес регистрации</Label>
              <Input id="address" placeholder="г. Москва, ул. Примерная, д. 1, кв. 1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Input id="notes" placeholder="Дополнительная информация" />
            </div>
          </div>
        </div>
      </div>

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

export default AddDriver;