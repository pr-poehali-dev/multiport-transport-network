import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Contractor } from '@/api/contractors';

interface ContractBasicInfoProps {
  contractNumber: string;
  setContractNumber: (value: string) => void;
  contractDate: string;
  setContractDate: (value: string) => void;
  
  customerId: number | undefined;
  searchCustomer: string;
  setSearchCustomer: (value: string) => void;
  showCustomerList: boolean;
  setShowCustomerList: (value: boolean) => void;
  handleSelectCustomer: (contractor: Contractor) => void;
  filteredCustomers: Contractor[];
  
  carrierId: number | undefined;
  searchCarrier: string;
  setSearchCarrier: (value: string) => void;
  showCarrierList: boolean;
  setShowCarrierList: (value: boolean) => void;
  handleSelectCarrier: (contractor: Contractor) => void;
  filteredCarriers: Contractor[];
  
  vehicleType: string;
  setVehicleType: (value: string) => void;
  vehicleCapacityTons: string;
  setVehicleCapacityTons: (value: string) => void;
  vehicleCapacityM3: string;
  setVehicleCapacityM3: (value: string) => void;
  temperatureMode: string;
  setTemperatureMode: (value: string) => void;
  additionalConditions: string;
  setAdditionalConditions: (value: string) => void;
}

export default function ContractBasicInfo({
  contractNumber,
  setContractNumber,
  contractDate,
  setContractDate,
  customerId,
  searchCustomer,
  setSearchCustomer,
  showCustomerList,
  setShowCustomerList,
  handleSelectCustomer,
  filteredCustomers,
  carrierId,
  searchCarrier,
  setSearchCarrier,
  showCarrierList,
  setShowCarrierList,
  handleSelectCarrier,
  filteredCarriers,
  vehicleType,
  setVehicleType,
  vehicleCapacityTons,
  setVehicleCapacityTons,
  vehicleCapacityM3,
  setVehicleCapacityM3,
  temperatureMode,
  setTemperatureMode,
  additionalConditions,
  setAdditionalConditions
}: ContractBasicInfoProps) {
  return (
    <>
      <div className="bg-white rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="FileText" size={20} className="text-[#0ea5e9]" />
            Основная информация
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractNumber">Номер договора *</Label>
              <Input
                id="contractNumber"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="2024-001"
              />
            </div>

            <div>
              <Label htmlFor="contractDate">Дата договора *</Label>
              <Input
                id="contractDate"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" data-dropdown>
            <Label htmlFor="customer">Заказчик *</Label>
            <Input
              id="customer"
              value={searchCustomer}
              onChange={(e) => {
                setSearchCustomer(e.target.value);
                setShowCustomerList(true);
              }}
              onFocus={() => setShowCustomerList(true)}
              placeholder="Поиск заказчика..."
            />
            {showCustomerList && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.map((contractor) => (
                  <div
                    key={contractor.id}
                    onClick={() => handleSelectCustomer(contractor)}
                    className="px-4 py-2 hover:bg-[#0ea5e9]/10 cursor-pointer text-sm"
                  >
                    {contractor.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" data-dropdown>
            <Label htmlFor="carrier">Перевозчик *</Label>
            <Input
              id="carrier"
              value={searchCarrier}
              onChange={(e) => {
                setSearchCarrier(e.target.value);
                setShowCarrierList(true);
              }}
              onFocus={() => setShowCarrierList(true)}
              placeholder="Поиск перевозчика..."
            />
            {showCarrierList && filteredCarriers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCarriers.map((contractor) => (
                  <div
                    key={contractor.id}
                    onClick={() => handleSelectCarrier(contractor)}
                    className="px-4 py-2 hover:bg-[#0ea5e9]/10 cursor-pointer text-sm"
                  >
                    {contractor.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Truck" size={20} className="text-[#0ea5e9]" />
          Условия перевозки
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="vehicleType">Тип транспорта</Label>
            <Input
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="Рефрижератор"
            />
          </div>

          <div>
            <Label htmlFor="vehicleCapacityTons">Грузоподъёмность (т)</Label>
            <Input
              id="vehicleCapacityTons"
              type="number"
              step="0.1"
              value={vehicleCapacityTons}
              onChange={(e) => setVehicleCapacityTons(e.target.value)}
              placeholder="20"
            />
          </div>

          <div>
            <Label htmlFor="vehicleCapacityM3">Объём (м³)</Label>
            <Input
              id="vehicleCapacityM3"
              type="number"
              step="0.1"
              value={vehicleCapacityM3}
              onChange={(e) => setVehicleCapacityM3(e.target.value)}
              placeholder="82"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="temperatureMode">Температурный режим</Label>
          <Input
            id="temperatureMode"
            value={temperatureMode}
            onChange={(e) => setTemperatureMode(e.target.value)}
            placeholder="от -18°C до -20°C"
          />
        </div>

        <div>
          <Label htmlFor="additionalConditions">Дополнительные условия</Label>
          <Textarea
            id="additionalConditions"
            value={additionalConditions}
            onChange={(e) => setAdditionalConditions(e.target.value)}
            placeholder="Укажите дополнительные требования..."
            rows={3}
          />
        </div>
      </div>
    </>
  );
}
