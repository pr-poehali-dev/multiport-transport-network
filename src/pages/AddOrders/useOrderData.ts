import { useState, useEffect } from 'react';
import { getVehicles, Vehicle } from '@/api/vehicles';
import { getContractors, Contractor } from '@/api/contractors';
import { getDrivers, Driver } from '@/api/drivers';

export function useOrderData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Ошибка при загрузке автомобилей:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(data);
      } catch (error) {
        console.error('Ошибка при загрузке водителей:', error);
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchContractors = async () => {
      setLoadingContractors(true);
      try {
        const data = await getContractors();
        setContractors(data);
      } catch (error) {
        console.error('Ошибка при загрузке контрагентов:', error);
      } finally {
        setLoadingContractors(false);
      }
    };
    fetchContractors();
  }, []);

  return {
    vehicles,
    loadingVehicles,
    drivers,
    contractors,
    loadingContractors
  };
}
