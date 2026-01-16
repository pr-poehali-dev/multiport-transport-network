import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TopBar from '@/components/TopBar';
import { Order } from '@/api/orders';
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
import { useOrderState } from './AddOrders/useOrderState';
import { useOrderHandlers } from './AddOrders/useOrderHandlers';
import { useVehiclesData } from './AddOrders/useVehiclesData';
import { useContractorsData } from './AddOrders/useContractorsData';

interface AddOrdersProps {
  order?: Order;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddOrders({ order, onBack, onMenuClick }: AddOrdersProps) {
  const state = useOrderState(order);

  const handlers = useOrderHandlers({
    isEditMode: state.isEditMode,
    order,
    routes: state.routes,
    setRoutes: state.setRoutes,
    prefix: state.prefix,
    orderDate: state.orderDate,
    setRouteNumber: state.setRouteNumber,
    consignees: state.consignees,
    setConsignees: state.setConsignees,
    isOrderLocked: state.isOrderLocked,
    setIsOrderLocked: state.setIsOrderLocked,
    setLockedRoutes: state.setLockedRoutes,
    setShowCancelDialog: state.setShowCancelDialog,
    setShowConsigneeList: state.setShowConsigneeList,
    setSearchConsignee: state.setSearchConsignee,
    drivers: state.drivers,
    setSearchVehicle: state.setSearchVehicle,
    setShowVehicleList: state.setShowVehicleList,
    onBack
  });

  const vehiclesData = useVehiclesData({
    routes: state.routes,
    vehicles: state.vehicles,
    setVehicles: state.setVehicles,
    drivers: state.drivers,
    setDrivers: state.setDrivers,
    setLoadingVehicles: state.setLoadingVehicles,
    setSearchVehicle: state.setSearchVehicle,
    setShowVehicleList: state.setShowVehicleList,
    vehicleInputRefs: state.vehicleInputRefs,
    isEditMode: state.isEditMode,
    order
  });

  const contractorsData = useContractorsData({
    consignees: state.consignees,
    contractors: state.contractors,
    setContractors: state.setContractors,
    loadingContractors: state.loadingContractors,
    setLoadingContractors: state.setLoadingContractors,
    setSearchConsignee: state.setSearchConsignee,
    setShowConsigneeList: state.setShowConsigneeList,
    isEditMode: state.isEditMode,
    order
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={state.isEditMode ? 'Редактировать заказ' : 'Добавить заказ'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handlers.handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={handlers.handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button
              onClick={handlers.handleSave}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              <Icon name="Check" size={18} />
              <span className="hidden sm:inline">Сохранить</span>
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <OrderInfoSection
            prefix={state.prefix}
            setPrefix={state.setPrefix}
            orderDate={state.orderDate}
            setOrderDate={state.setOrderDate}
            routeNumber={state.routeNumber}
            invoice={state.invoice}
            setInvoice={state.setInvoice}
            trak={state.trak}
            setTrak={state.setTrak}
            weight={state.weight}
            setWeight={state.setWeight}
            consignees={state.consignees}
            isOrderLocked={state.isOrderLocked}
            searchConsignee={state.searchConsignee}
            setSearchConsignee={state.setSearchConsignee}
            showConsigneeList={state.showConsigneeList}
            setShowConsigneeList={state.setShowConsigneeList}
            loadingContractors={state.loadingContractors}
            getFilteredContractors={(consigneeId) => contractorsData.getFilteredContractors(consigneeId, state.searchConsignee)}
            handleSelectConsignee={handlers.handleSelectConsignee}
            handleUpdateConsignee={handlers.handleUpdateConsignee}
            handleRemoveConsignee={handlers.handleRemoveConsignee}
            handleAddConsignee={handlers.handleAddConsignee}
            handleSaveOrder={handlers.handleSaveOrder}
            getFullRoute={handlers.getFullRoute}
          />

          <RouteSection
            routes={state.routes}
            isOrderLocked={state.isOrderLocked}
            handleAddRoute={handlers.handleAddRoute}
            handleRemoveRoute={handlers.handleRemoveRoute}
            handleUpdateRoute={handlers.handleUpdateRoute}
            handleSaveAndGo={handlers.handleSaveAndGo}
            handleEditRoute={handlers.handleEditRoute}
            handleAddStop={handlers.handleAddStop}
            handleRemoveStop={handlers.handleRemoveStop}
            handleUpdateStop={handlers.handleUpdateStop}
            vehicles={state.vehicles}
            drivers={state.drivers}
            searchVehicle={state.searchVehicle}
            setSearchVehicle={state.setSearchVehicle}
            showVehicleList={state.showVehicleList}
            setShowVehicleList={state.setShowVehicleList}
            vehicleInputRefs={state.vehicleInputRefs}
            getFilteredVehicles={(routeId) => vehiclesData.getFilteredVehicles(routeId, state.searchVehicle)}
            handleSelectVehicle={handlers.handleSelectVehicle}
            loadingVehicles={state.loadingVehicles}
          />
        </div>
      </div>

      <AlertDialog open={state.showCancelDialog} onOpenChange={state.setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon name="AlertTriangle" size={18} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left">Подтверждение отмены</AlertDialogTitle>
                <AlertDialogDescription className="text-left mt-2">
                  Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0 gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlers.confirmCancel} className="m-0 bg-red-600 hover:bg-red-700 gap-2">
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
