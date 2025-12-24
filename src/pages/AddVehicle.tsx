import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
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

interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  registrationNumber: string;
  vin?: string;
  year?: number;
  color?: string;
  notes?: string;
}

interface AddVehicleProps {
  vehicle?: Vehicle;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddVehicle({ vehicle, onBack, onMenuClick }: AddVehicleProps) {
  const { toast } = useToast();
  const isEditMode = !!vehicle;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Основная информация
  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [registrationNumber, setRegistrationNumber] = useState(vehicle?.registrationNumber || '');
  
  // Дополнительная информация
  const [vin, setVin] = useState(vehicle?.vin || '');
  const [year, setYear] = useState(vehicle?.year?.toString() || '');
  const [color, setColor] = useState(vehicle?.color || '');
  const [notes, setNotes] = useState(vehicle?.notes || '');

  // Показываем дополнительные поля если есть данные
  useState(() => {
    if (vehicle) {
      const hasOptional = vehicle.vin || vehicle.year || vehicle.color || vehicle.notes;
      setShowOptionalFields(!!hasOptional);
    }
  });

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!brand.trim() || !model.trim() || !registrationNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Марка, Модель, Гос. номер'
      });
      return;
    }

    setIsSaving(true);

    try {
      const vehicleData = {
        brand: brand.trim(),
        model: model.trim(),
        registrationNumber: registrationNumber.trim(),
        vin: vin.trim() || undefined,
        year: year ? parseInt(year) : undefined,
        color: color.trim() || undefined,
        notes: notes.trim() || undefined
      };

      // TODO: подключить API для создания/обновления автомобиля

      toast({
        title: 'Успешно сохранено',
        description: isEditMode ? 'Данные автомобиля обновлены' : 'Автомобиль добавлен в базу данных'
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить автомобиль'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Основная информация */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Car" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Марка *</Label>
                <Input 
                  id="brand" 
                  placeholder="Toyota" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Модель *</Label>
                <Input 
                  id="model" 
                  placeholder="Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Государственный номер *</Label>
              <Input 
                id="registrationNumber" 
                placeholder="А123БВ777"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Дополнительная информация */}
          {!showOptionalFields ? (
            <button
              onClick={() => setShowOptionalFields(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={18} />
              <span>Добавить дополнительную информацию</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Дополнительная информация</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOptionalFields(false);
                    setVin('');
                    setYear('');
                    setColor('');
                    setNotes('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input 
                    id="vin" 
                    placeholder="1HGBH41JXMN109186"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Год выпуска</Label>
                  <Input 
                    id="year" 
                    type="number"
                    placeholder="2020"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Цвет</Label>
                <Input 
                  id="color" 
                  placeholder="Белый"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Дополнительная информация об автомобиле..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Диалог отмены */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить изменения?</AlertDialogTitle>
            <AlertDialogDescription>
              Все несохранённые данные будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Да, отменить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddVehicle;
