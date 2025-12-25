import { RefObject } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Driver } from '@/api/drivers';

interface DriverSectionProps {
  showDriver: boolean;
  setShowDriver: (value: boolean) => void;
  searchDriver: string;
  setSearchDriver: (value: string) => void;
  showDriverList: boolean;
  setShowDriverList: (value: boolean) => void;
  drivers: Driver[];
  loadingDrivers: boolean;
  driverInputRef: RefObject<HTMLInputElement>;
  setDriverId: (value: string) => void;
}

function DriverSection({
  showDriver,
  setShowDriver,
  searchDriver,
  setSearchDriver,
  showDriverList,
  setShowDriverList,
  drivers,
  loadingDrivers,
  driverInputRef,
  setDriverId
}: DriverSectionProps) {
  if (!showDriver) {
    return (
      <button
        onClick={() => setShowDriver(true)}
        className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Icon name="Plus" size={20} />
        <span>Назначить водителя</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
          <h2 className="text-base lg:text-lg font-semibold text-foreground">Водитель</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowDriver(false);
            setDriverId('');
          }}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="Trash2" size={18} />
        </Button>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="driver">Выбор водителя</Label>
        <div className="relative" ref={driverInputRef}>
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            id="driver"
            placeholder="Начните вводить ФИО водителя..."
            value={searchDriver}
            onChange={(e) => {
              setSearchDriver(e.target.value);
              setShowDriverList(true);
            }}
            onFocus={() => setShowDriverList(true)}
            className="pl-9"
          />
          {loadingDrivers && (
            <Icon name="Loader2" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          
          {showDriverList && drivers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {drivers
                .filter(d => {
                  const fullName = `${d.lastName} ${d.firstName} ${d.middleName || ''}`.toLowerCase();
                  return fullName.includes(searchDriver.toLowerCase());
                })
                .map(driver => (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => {
                      setDriverId(driver.id?.toString() || '');
                      setSearchDriver(`${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.trim());
                      setShowDriverList(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-border last:border-0"
                  >
                    <Icon name="UserCircle" size={18} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {driver.lastName} {driver.firstName} {driver.middleName || ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{driver.phone}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Водитель будет закреплён за этим автомобилем
        </p>
      </div>
    </div>
  );
}

export default DriverSection;