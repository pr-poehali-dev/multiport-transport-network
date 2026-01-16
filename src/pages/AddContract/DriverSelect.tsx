import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Driver } from '@/api/drivers';
import { Vehicle } from '@/api/vehicles';

interface DriverSelectProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  loadingData: boolean;
  selectedId?: number;
  onSelect: (driver: Driver, license: string) => void;
}

export default function DriverSelect({
  drivers,
  vehicles,
  loadingData,
  selectedId,
  onSelect
}: DriverSelectProps) {
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const selected = drivers.find(d => d.id === selectedId);
      if (selected) {
        const fullName = `${selected.lastName} ${selected.firstName} ${selected.middleName || ''}`;
        setSearch(fullName);
      }
    }
  }, [selectedId, drivers]);

  const getFilteredDrivers = () => {
    return drivers.filter(d => {
      const fullName = `${d.lastName} ${d.firstName} ${d.middleName || ''}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
  };

  const handleSelect = (driver: Driver) => {
    const fullName = `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`;
    setSearch(fullName);
    
    const license = `${driver.licenseSeries || ''} ${driver.licenseNumber || ''} ${driver.licenseIssued || ''} ${driver.licenseDate || ''}`.trim();
    
    onSelect(driver, license);
    setShowList(false);
  };

  const selectedDriver = selectedId ? drivers.find(d => d.id === selectedId) : undefined;
  const selectedVehicle = selectedId ? vehicles.find(v => v.driverId === selectedId) : undefined;

  return (
    <>
      <div className="space-y-2 relative" data-dropdown>
        <Label htmlFor="driverName">ФИО водителя</Label>
        <Input 
          id="driverName"
          placeholder="Начните вводить ФИО"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowList(true);
          }}
          onFocus={() => setShowList(true)}
        />
        {showList && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {loadingData ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
            ) : getFilteredDrivers().length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Водители не найдены</div>
            ) : (
              getFilteredDrivers().map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleSelect(driver)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium">
                    {driver.lastName} {driver.firstName} {driver.middleName || ''}
                  </div>
                  <div className="text-xs text-muted-foreground">{driver.phone}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {selectedDriver && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Телефон: </span>
              <span className="text-muted-foreground">{selectedDriver.phone}</span>
            </div>
            {selectedDriver.phoneExtra && (
              <div>
                <span className="font-medium">Доп. телефон: </span>
                <span className="text-muted-foreground">{selectedDriver.phoneExtra}</span>
              </div>
            )}
          </div>
          
          {(selectedDriver.licenseSeries || selectedDriver.licenseNumber) && (
            <div>
              <span className="font-medium">Вод. удостоверение: </span>
              <span className="text-muted-foreground">
                {selectedDriver.licenseSeries} {selectedDriver.licenseNumber} {selectedDriver.licenseIssued} {selectedDriver.licenseDate}
              </span>
            </div>
          )}
          
          {(selectedDriver.passportSeries || selectedDriver.passportNumber) && (
            <div>
              <span className="font-medium">Паспорт: </span>
              <span className="text-muted-foreground">
                {selectedDriver.passportSeries} {selectedDriver.passportNumber} {selectedDriver.passportIssued} {selectedDriver.passportDate}
              </span>
            </div>
          )}
          
          {selectedVehicle && (
            <div>
              <span className="font-medium">ТС: </span>
              <span className="text-muted-foreground">
                {selectedVehicle.registrationNumber} / {selectedVehicle.trailerNumber}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
