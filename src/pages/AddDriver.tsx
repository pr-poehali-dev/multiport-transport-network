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
  onMenuClick: () => void;
}

function AddDriver({ onBack, onMenuClick }: AddDriverProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-white border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Icon name="Menu" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-gray-100"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-base lg:text-xl font-semibold text-foreground">Добавить водителя</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2">
              <Icon name="Check" size={18} />
              <span className="hidden sm:inline">Сохранить</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Основная информация */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input id="lastName" placeholder="Иванов" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input id="firstName" placeholder="Иван" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input id="middleName" placeholder="Иванович" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон 1 *</Label>
                <Input id="phone" placeholder="+7 (999) 123-45-67" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneExtra">Телефон 2</Label>
                <Input id="phoneExtra" placeholder="+7 (999) 123-45-67" />
              </div>
            </div>
          </div>

          {/* Паспорт */}
          {!showPassport ? (
            <button
              onClick={() => setShowPassport(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить паспорт</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Паспорт</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassport(false)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportSeries">Серия</Label>
                  <Input id="passportSeries" placeholder="1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Номер</Label>
                  <Input id="passportNumber" placeholder="567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportDate">Дата выдачи</Label>
                  <Input id="passportDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportIssued">Кем выдан</Label>
                <Input id="passportIssued" placeholder="ОВД Центрального района г. Москвы" />
              </div>
            </div>
          )}

          {/* Водительское удостоверение */}
          {!showLicense ? (
            <button
              onClick={() => setShowLicense(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить водительское удостоверение</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Водительское удостоверение</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLicense(false)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseSeries">Серия</Label>
                  <Input id="licenseSeries" placeholder="1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Номер</Label>
                  <Input id="licenseNumber" placeholder="567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseDate">Дата выдачи</Label>
                  <Input id="licenseDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseIssued">Кем выдан</Label>
                <Input id="licenseIssued" placeholder="ГИБДД г. Москва" />
              </div>
            </div>
          )}
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