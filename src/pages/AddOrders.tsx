import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { createOrder, updateOrder, Order } from '@/api/orders';
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
import OrderInfoSection from './AddOrders/OrderInfoSection';
import RouteSection from './AddOrders/RouteSection';
import { useOrderData } from './AddOrders/useOrderData';
import { useOrderForm } from './AddOrders/useOrderForm';

interface AddOrdersProps {
  order?: Order;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddOrders({ order, onBack, onMenuClick }: AddOrdersProps) {
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    vehicles,
    loadingVehicles,
    drivers,
    contractors,
    loadingContractors
  } = useOrderData();

  const {
    isEditMode,
    routes,
    prefix,
    setPrefix,
    orderDate,
    setOrderDate,
    routeNumber,
    setRouteNumber,
    invoice,
    setInvoice,
    trak,
    setTrak,
    weight,
    setWeight,
    consignees,
    searchVehicle,
    setSearchVehicle,
    showVehicleList,
    setShowVehicleList,
    searchConsignee,
    setSearchConsignee,
    showConsigneeList,
    setShowConsigneeList,
    vehicleInputRefs,
    isOrderLocked,
    handleSaveOrder,
    handleSaveAndGo,
    handleEditRoute,
    handleAddRoute,
    handleRemoveRoute,
    handleUpdateRoute,
    handleAddStop,
    handleRemoveStop,
    handleUpdateStop,
    getFullRoute,
    generateRouteNumber,
    handleAddConsignee,
    handleRemoveConsignee,
    handleUpdateConsignee
  } = useOrderForm(order);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    if (!isEditMode) {
      if (!isOrderLocked) {
        toast({
          title: 'Ошибка',
          description: 'Сначала нужно сохранить заказ',
          variant: 'destructive'
        });
        return;
      }

      if (routes.length > 0 && routes.some(r => !r.isLocked)) {
        toast({
          title: 'Ошибка',
          description: 'Все маршруты должны быть сохранены',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const orderData = {
        prefix,
        orderDate,
        routeNumber,
        invoice,
        trak,
        weight: weight ? parseFloat(weight) : undefined,
        fullRoute: getFullRoute(),
        consignees: consignees.map((c, idx) => ({
          contractorId: c.contractorId,
          name: c.name,
          note: c.note,
          position: idx
        })),
        routes: routes.map((r, idx) => ({
          from: r.from,
          to: r.to,
          vehicleId: r.vehicleId ? parseInt(r.vehicleId) : undefined,
          driverName: r.driverName,
          loadingDate: r.loadingDate || undefined,
          position: idx,
          additionalStops: r.additionalStops.map((s, sIdx) => ({
            type: s.type,
            address: s.address,
            note: s.note,
            position: sIdx
          }))
        }))
      };

      if (isEditMode && order?.id) {
        await updateOrder(order.id, orderData);
        toast({
          title: 'Готово',
          description: 'Заказ успешно обновлён'
        });
      } else {
        await createOrder(orderData);
        toast({
          title: 'Готово',
          description: 'Заказ успешно создан и сохранен в базу данных'
        });
      }
      onBack();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить заказ в базу данных',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopBar 
        title={isEditMode ? "Редактирование заказа" : "Новый заказ"}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} size="sm">
              <Icon name="X" size={16} className="mr-1" />
              Отменить
            </Button>
            <Button onClick={handleSave} size="sm" className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90">
              <Icon name="Save" size={16} className="mr-1" />
              {isEditMode ? 'Обновить' : 'Сохранить в БД'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
          <OrderInfoSection
            prefix={prefix}
            setPrefix={setPrefix}
            orderDate={orderDate}
            setOrderDate={setOrderDate}
            routeNumber={routeNumber}
            setRouteNumber={setRouteNumber}
            invoice={invoice}
            setInvoice={setInvoice}
            trak={trak}
            setTrak={setTrak}
            weight={weight}
            setWeight={setWeight}
            fullRoute={getFullRoute()}
            consignees={consignees}
            contractors={contractors}
            loadingContractors={loadingContractors}
            searchConsignee={searchConsignee}
            setSearchConsignee={setSearchConsignee}
            showConsigneeList={showConsigneeList}
            setShowConsigneeList={setShowConsigneeList}
            onAddConsignee={handleAddConsignee}
            onRemoveConsignee={handleRemoveConsignee}
            onUpdateConsignee={handleUpdateConsignee}
            onGenerateRouteNumber={generateRouteNumber}
            isOrderLocked={isOrderLocked}
            onSaveOrder={handleSaveOrder}
          />

          <RouteSection
            routes={routes}
            vehicles={vehicles}
            drivers={drivers}
            loadingVehicles={loadingVehicles}
            searchVehicle={searchVehicle}
            setSearchVehicle={setSearchVehicle}
            showVehicleList={showVehicleList}
            setShowVehicleList={setShowVehicleList}
            vehicleInputRefs={vehicleInputRefs}
            isOrderLocked={isOrderLocked}
            onAddRoute={handleAddRoute}
            onRemoveRoute={handleRemoveRoute}
            onUpdateRoute={handleUpdateRoute}
            onSaveAndGo={handleSaveAndGo}
            onEditRoute={handleEditRoute}
            onAddStop={handleAddStop}
            onRemoveStop={handleRemoveStop}
            onUpdateStop={handleUpdateStop}
          />
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить создание заказа?</AlertDialogTitle>
            <AlertDialogDescription>
              Все введенные данные будут потеряны. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Да, отменить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddOrders;