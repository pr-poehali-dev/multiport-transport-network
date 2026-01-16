import { useEffect } from 'react';
import { getVehicles, Vehicle } from '@/api/vehicles';
import { getDrivers, Driver } from '@/api/drivers';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/api/orders';
import { Route } from './types';

interface UseVehiclesDataProps {
  routes: Route[];
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  setLoadingVehicles: (loading: boolean) => void;
  setSearchVehicle: (setter: (prev: Record<string, string>) => Record<string, string>) => void;
  setShowVehicleList: (setter: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  vehicleInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  isEditMode: boolean;
  order?: Order;
}

export function useVehiclesData({
  routes,
  vehicles,
  setVehicles,
  drivers,
  setDrivers,
  setLoadingVehicles,
  setSearchVehicle,
  setShowVehicleList,
  vehicleInputRefs,
  isEditMode,
  order
}: UseVehiclesDataProps) {
  const { toast } = useToast();

  const loadVehiclesList = async () => {
    setLoadingVehicles(true);
    try {
      const [vehiclesData, driversData] = await Promise.all([
        getVehicles(),
        getDrivers()
      ]);
      setVehicles(vehiclesData.vehicles || []);
      setDrivers(driversData.drivers || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список автомобилей'
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const getFilteredVehicles = (routeId: string, searchVehicle: Record<string, string>) => {
    const search = searchVehicle[routeId]?.toLowerCase() || '';
    return vehicles.filter(v => 
      v.registrationNumber?.toLowerCase().includes(search) ||
      v.trailerNumber?.toLowerCase().includes(search)
    );
  };

  useEffect(() => {
    if (routes.length > 0 && vehicles.length === 0) {
      loadVehiclesList();
    }
  }, [routes.length]);

  useEffect(() => {
    if (isEditMode && order && vehicles.length > 0) {
      const newSearchVehicle: Record<string, string> = {};
      order.routes.forEach((route) => {
        if (route.vehicleId) {
          const vehicle = vehicles.find(v => v.id === route.vehicleId);
          if (vehicle) {
            newSearchVehicle[route.id?.toString() || ''] = `${vehicle.registrationNumber} / ${vehicle.trailerNumber}`;
          }
        }
      });
      setSearchVehicle(() => newSearchVehicle);
    }
  }, [isEditMode, order, vehicles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      Object.entries(vehicleInputRefs.current).forEach(([routeId, ref]) => {
        if (ref && !ref.parentElement?.contains(target)) {
          setShowVehicleList(prev => ({ ...prev, [routeId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    loadVehiclesList,
    getFilteredVehicles
  };
}
