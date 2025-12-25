import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface AddOrdersProps {
  onBack: () => void;
  onMenuClick: () => void;
}

interface Route {
  id: string;
  from: string;
  to: string;
}

interface Consignee {
  id: string;
  name: string;
  note: string;
}

function AddOrders({ onBack, onMenuClick }: AddOrdersProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([{ id: '1', from: '', to: '' }]);
  const [prefix, setPrefix] = useState<string>('EU');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [routeNumber, setRouteNumber] = useState<string>('');
  const [invoice, setInvoice] = useState<string>('');
  const [tak, setTak] = useState<string>('');
  const [consignees, setConsignees] = useState<Consignee[]>([{ id: '1', name: '', note: '' }]);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = () => {
    // Логика сохранения
    onBack();
  };

  const handleAddRoute = () => {
    setRoutes([...routes, { id: Date.now().toString(), from: '', to: '' }]);
  };

  const handleRemoveRoute = (id: string) => {
    if (routes.length > 1) {
      setRoutes(routes.filter(r => r.id !== id));
    }
  };

  const handleUpdateRoute = (id: string, field: 'from' | 'to', value: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const getFullRoute = () => {
    return routes
      .filter(r => r.from || r.to)
      .map(r => `${r.from} → ${r.to}`)
      .join(' → ');
  };

  const generateRouteNumber = () => {
    if (!orderDate) return '';
    const date = new Date(orderDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${prefix}-${day}${month}${year}-001`;
  };

  useEffect(() => {
    setRouteNumber(generateRouteNumber());
  }, [prefix, orderDate]);

  const handleAddConsignee = () => {
    setConsignees([...consignees, { id: Date.now().toString(), name: '', note: '' }]);
  };

  const handleRemoveConsignee = (id: string) => {
    if (consignees.length > 1) {
      setConsignees(consignees.filter(c => c.id !== id));
    }
  };

  const handleUpdateConsignee = (id: string, field: 'name' | 'note', value: string) => {
    setConsignees(consignees.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title="Добавить заказ"
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={16} />
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 bg-[#0ea5e9] hover:bg-[#0284c7]"
            >
              <Icon name="Check" size={16} />
              Сохранить
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Package" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Заказ</h2>
            </div>

            <div className="space-y-2">
              <Label>Маршрут</Label>
              <Input
                value={getFullRoute()}
                readOnly
                placeholder="Маршрут будет составлен из точек ниже"
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Префикс</Label>
                <Select value={prefix} onValueChange={setPrefix}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="CH">CH</SelectItem>
                    <SelectItem value="RF">RF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Дата заказа</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Номер маршрута</Label>
                <Input
                  value={routeNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Инвойс</Label>
                <Input
                  placeholder="Введите номер инвойса"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>ТАК</Label>
                <Input
                  placeholder="Введите ТАК"
                  value={tak}
                  onChange={(e) => setTak(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Грузополучатели</Label>
              {consignees.map((consignee, index) => (
                <div key={consignee.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder={`Грузополучатель ${index + 1}`}
                      value={consignee.name}
                      onChange={(e) => handleUpdateConsignee(consignee.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Примечание"
                      value={consignee.note}
                      onChange={(e) => handleUpdateConsignee(consignee.id, 'note', e.target.value)}
                    />
                  </div>
                  {consignees.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConsignee(consignee.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddConsignee}
                className="w-full border border-dashed border-border rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon name="Plus" size={16} />
                <span>Добавить грузополучателя</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Многомаршрутность</h2>
            </div>

            <div className="space-y-3">
              {routes.map((route, index) => (
                <div key={route.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Откуда (маршрут {index + 1})</Label>
                      <Input
                        placeholder="Москва"
                        value={route.from}
                        onChange={(e) => handleUpdateRoute(route.id, 'from', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Куда (маршрут {index + 1})</Label>
                      <Input
                        placeholder="Санкт-Петербург"
                        value={route.to}
                        onChange={(e) => handleUpdateRoute(route.id, 'to', e.target.value)}
                      />
                    </div>
                  </div>
                  {routes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRoute(route.id)}
                      className="hover:bg-red-50 hover:text-red-600 mt-7"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddRoute}
              className="w-full border border-dashed border-border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={18} />
              <span>Добавить маршрут</span>
            </button>
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
              Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
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

export default AddOrders;