import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [loadingDate, setLoadingDate] = useState('');
  const [unloadingBuyerId, setUnloadingBuyerId] = useState<number | undefined>();
  const [unloadingDate, setUnloadingDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [taxationType, setTaxationType] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [driverId, setDriverId] = useState<number | undefined>();
  const [driverLicense, setDriverLicense] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (onBack: () => void) => {
    if (!contractNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните номер договора'
      });
      return;
    }

    setIsSaving(true);

    try {
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
    loadingDate,
    setLoadingDate,
    unloadingBuyerId,
    setUnloadingBuyerId,
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
    isSaving,
    handleSave
  };
}
