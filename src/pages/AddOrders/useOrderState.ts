import { useState, useRef } from 'react';
import { Order } from '@/api/orders';
import { Route, Consignee } from './types';
import { Vehicle } from '@/api/vehicles';
import { Driver } from '@/api/drivers';
import { Contractor } from '@/api/contractors';

export function useOrderState(order?: Order) {
  const isEditMode = !!order;
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>(order?.routes.map((r, idx) => ({
    id: r.id?.toString() || idx.toString(),
    from: r.from,
    to: r.to,
    vehicleId: r.vehicleId?.toString() || '',
    driverName: r.driverName || '',
    loadingDate: r.loadingDate || '',
    additionalStops: r.additionalStops || [],
    isLocked: false
  })) || []);
  const [prefix, setPrefix] = useState<string>(order?.prefix || 'EU');
  const [orderDate, setOrderDate] = useState<string>(order?.orderDate || new Date().toISOString().split('T')[0]);
  const [routeNumber, setRouteNumber] = useState<string>(order?.routeNumber || '');
  const [invoice, setInvoice] = useState<string>(order?.invoice || '');
  const [trak, setTrak] = useState<string>(order?.trak || '');
  const [weight, setWeight] = useState<string>(order?.weight?.toString() || '');
  const [consignees, setConsignees] = useState<Consignee[]>(order?.consignees.map((c, idx) => ({
    id: c.id?.toString() || idx.toString(),
    name: c.name,
    note: c.note || '',
    contractorId: c.contractorId
  })) || [{ id: '1', name: '', note: '' }]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchVehicle, setSearchVehicle] = useState<Record<string, string>>({});
  const [showVehicleList, setShowVehicleList] = useState<Record<string, boolean>>({});
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [searchConsignee, setSearchConsignee] = useState<Record<string, string>>({});
  const [showConsigneeList, setShowConsigneeList] = useState<Record<string, boolean>>({});
  const vehicleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lockedRoutes, setLockedRoutes] = useState<Set<string>>(new Set());
  const [isOrderLocked, setIsOrderLocked] = useState(!!order);

  return {
    isEditMode,
    showCancelDialog,
    setShowCancelDialog,
    routes,
    setRoutes,
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
    setConsignees,
    vehicles,
    setVehicles,
    loadingVehicles,
    setLoadingVehicles,
    drivers,
    setDrivers,
    searchVehicle,
    setSearchVehicle,
    showVehicleList,
    setShowVehicleList,
    contractors,
    setContractors,
    loadingContractors,
    setLoadingContractors,
    searchConsignee,
    setSearchConsignee,
    showConsigneeList,
    setShowConsigneeList,
    vehicleInputRefs,
    lockedRoutes,
    setLockedRoutes,
    isOrderLocked,
    setIsOrderLocked
  };
}
