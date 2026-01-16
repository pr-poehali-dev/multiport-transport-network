import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Driver } from '@/api/drivers';

interface ContractDriverInfoProps {
  driverId: number | undefined;
  searchDriver: string;
  setSearchDriver: (value: string) => void;
  showDriverList: boolean;
  setShowDriverList: (value: boolean) => void;
  handleSelectDriver: (driver: Driver) => void;
  filteredDrivers: Driver[];
  driverLicense: string;
  setDriverLicense: (value: string) => void;
}

export default function ContractDriverInfo({
  driverId,
  searchDriver,
  setSearchDriver,
  showDriverList,
  setShowDriverList,
  handleSelectDriver,
  filteredDrivers,
  driverLicense,
  setDriverLicense
}: ContractDriverInfoProps) {
  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="User" size={20} className="text-[#0ea5e9]" />
        Водитель и транспорт
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative" data-dropdown>
          <Label htmlFor="driver">Водитель</Label>
          <Input
            id="driver"
            value={searchDriver}
            onChange={(e) => {
              setSearchDriver(e.target.value);
              setShowDriverList(true);
            }}
            onFocus={() => setShowDriverList(true)}
            placeholder="Поиск водителя..."
          />
          {showDriverList && filteredDrivers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredDrivers.map((driver) => {
                const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`;
                return (
                  <div
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver)}
                    className="px-4 py-2 hover:bg-[#0ea5e9]/10 cursor-pointer text-sm"
                  >
                    {fullName}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="driverLicense">Водительское удостоверение</Label>
          <Input
            id="driverLicense"
            value={driverLicense}
            onChange={(e) => setDriverLicense(e.target.value)}
            placeholder="Серия номер, дата выдачи..."
            readOnly={!!driverId}
          />
        </div>
      </div>
    </div>
  );
}
