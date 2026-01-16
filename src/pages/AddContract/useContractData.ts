import { useState, useEffect } from 'react';
import { getContractors, Contractor } from '@/api/contractors';
import { getDrivers, Driver } from '@/api/drivers';
import { getVehicles, Vehicle } from '@/api/vehicles';
import { useToast } from '@/hooks/use-toast';

export function useContractData() {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [contractorsData, driversData, vehiclesData] = await Promise.all([
          getContractors(),
          getDrivers(),
          getVehicles()
        ]);
        setContractors(contractorsData.contractors || []);
        setDrivers(driversData.drivers || []);
        setVehicles(vehiclesData.vehicles || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Не удалось загрузить данные'
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  return {
    contractors,
    drivers,
    vehicles,
    loadingData
  };
}
