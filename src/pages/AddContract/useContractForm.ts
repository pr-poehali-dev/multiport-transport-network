import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createContract } from '@/api/contracts';

export function useContractForm() {
  const { toast } = useToast();
  
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [carrierId, setCarrierId] = useState<number | undefined>();
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleCapacityTons, setVehicleCapacityTons] = useState('');
  const [vehicleCapacityM3, setVehicleCapacityM3] = useState('');
  const [temperatureMode, setTemperatureMode] = useState('');
  const [additionalConditions, setAdditionalConditions] = useState('');
  const [cargo, setCargo] = useState('');
  const [loadingSellerId, setLoadingSellerId] = useState<number | undefined>();
  const [loadingAddresses, setLoadingAddresses] = useState<string[]>([]);
  const [loadingDate, setLoadingDate] = useState('');
  const [unloadingBuyerId, setUnloadingBuyerId] = useState<number | undefined>();
  const [unloadingAddresses, setUnloadingAddresses] = useState<string[]>([]);
  const [unloadingDate, setUnloadingDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [taxationType, setTaxationType] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [driverId, setDriverId] = useState<number | undefined>();
  const [driverLicense, setDriverLicense] = useState('');
  const [vehicleId, setVehicleId] = useState<number | undefined>();
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (onBack: () => void, drivers: any[] = [], vehicles: any[] = []) => {
    if (!contractNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните номер договора'
      });
      return;
    }

    if (!cargo.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните наименование груза'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Копируем данные водителя
      let driverFullName = '';
      let driverPhone = '';
      let driverPhoneExtra = '';
      let driverPassport = '';
      let driverLicenseStr = '';
      
      if (driverId) {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
          driverFullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.trim();
          driverPhone = driver.phone || '';
          driverPhoneExtra = driver.phoneExtra || '';
          driverPassport = `${driver.passportSeries || ''} ${driver.passportNumber || ''} ${driver.passportIssued || ''} ${driver.passportDate || ''}`.trim();
          driverLicenseStr = `${driver.licenseSeries || ''} ${driver.licenseNumber || ''} ${driver.licenseIssued || ''} ${driver.licenseDate || ''}`.trim();
        }
      }

      // Копируем данные ТС
      let vehicleRegistrationNumber = '';
      let vehicleTrailerNumber = '';
      let vehicleBrandStr = '';
      
      if (vehicleId) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
          vehicleRegistrationNumber = vehicle.registrationNumber || '';
          vehicleTrailerNumber = vehicle.trailerNumber || '';
          vehicleBrandStr = vehicle.brand || '';
        }
      }

      await createContract({
        contractNumber,
        contractDate,
        customerId,
        carrierId,
        vehicleType,
        vehicleCapacityTons: vehicleCapacityTons ? parseFloat(vehicleCapacityTons) : undefined,
        vehicleCapacityM3: vehicleCapacityM3 ? parseFloat(vehicleCapacityM3) : undefined,
        temperatureMode,
        additionalConditions,
        cargo,
        loadingSellerId,
        loadingAddresses,
        loadingDate,
        unloadingBuyerId,
        unloadingAddresses,
        unloadingDate,
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : undefined,
        taxationType,
        paymentTerms,
        driverId,
        driverFullName,
        driverPhone,
        driverPhoneExtra,
        driverPassport,
        driverLicense: driverLicenseStr,
        vehicleId,
        vehicleRegistrationNumber,
        vehicleTrailerNumber,
        vehicleBrand: vehicleBrandStr
      });

      toast({
        title: 'Успешно сохранено',
        description: 'Договор-заявка создан'
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить договор-заявку'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    contractNumber,
    setContractNumber,
    contractDate,
    setContractDate,
    customerId,
    setCustomerId,
    carrierId,
    setCarrierId,
    vehicleType,
    setVehicleType,
    vehicleCapacityTons,
    setVehicleCapacityTons,
    vehicleCapacityM3,
    setVehicleCapacityM3,
    temperatureMode,
    setTemperatureMode,
    additionalConditions,
    setAdditionalConditions,
    cargo,
    setCargo,
    loadingSellerId,
    setLoadingSellerId,
    loadingAddresses,
    setLoadingAddresses,
    loadingDate,
    setLoadingDate,
    unloadingBuyerId,
    setUnloadingBuyerId,
    unloadingAddresses,
    setUnloadingAddresses,
    unloadingDate,
    setUnloadingDate,
    paymentAmount,
    setPaymentAmount,
    taxationType,
    setTaxationType,
    paymentTerms,
    setPaymentTerms,
    driverId,
    setDriverId,
    driverLicense,
    setDriverLicense,
    vehicleId,
    setVehicleId,
    isSaving,
    handleSave
  };
}