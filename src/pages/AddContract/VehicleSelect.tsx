import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/api/vehicles';

interface VehicleSelectProps {
  vehicles: Vehicle[];
  loadingData: boolean;
  selectedId?: number;
  onSelect: (vehicle: Vehicle) => void;
}

export default function VehicleSelect({
  vehicles,
  loadingData,
  selectedId,
  onSelect
}: VehicleSelectProps) {
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-vehicle-dropdown]')) {
        setShowList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const selected = vehicles.find(v => v.id === selectedId);
      if (selected) {
        setSearch(`${selected.registrationNumber} / ${selected.trailerNumber}`);
      }
    }
  }, [selectedId, vehicles]);

  const getFilteredVehicles = () => {
    return vehicles.filter(v => {
      const searchStr = `${v.registrationNumber} ${v.trailerNumber} ${v.model || ''}`.toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  };

  const handleSelect = (vehicle: Vehicle) => {
    setSearch(`${vehicle.registrationNumber} / ${vehicle.trailerNumber}`);
    onSelect(vehicle);
    setShowList(false);
  };

  const selectedVehicle = selectedId ? vehicles.find(v => v.id === selectedId) : undefined;

  return (
    <>
      <div className="space-y-2 relative" data-vehicle-dropdown>
        <Label htmlFor="vehicleNumber">Номер ТС / Прицепа</Label>
        <Input 
          id="vehicleNumber"
          placeholder="Начните вводить номер"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowList(true);
          }}
          onFocus={() => setShowList(true)}
        />
        {showList && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto" data-vehicle-dropdown>
            {loadingData ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
            ) : getFilteredVehicles().length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">ТС не найдены</div>
            ) : (
              getFilteredVehicles().map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelect(vehicle)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium">
                    {vehicle.registrationNumber} / {vehicle.trailerNumber}
                  </div>
                  {vehicle.model && (
                    <div className="text-xs text-muted-foreground">{vehicle.model}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {selectedVehicle && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Тягач: </span>
              <span className="text-muted-foreground">{selectedVehicle.registrationNumber}</span>
            </div>
            <div>
              <span className="font-medium">Прицеп: </span>
              <span className="text-muted-foreground">{selectedVehicle.trailerNumber}</span>
            </div>
          </div>
          
          {selectedVehicle.model && (
            <div>
              <span className="font-medium">Модель: </span>
              <span className="text-muted-foreground">{selectedVehicle.model}</span>
            </div>
          )}
          
          {selectedVehicle.yearOfManufacture && (
            <div>
              <span className="font-medium">Год выпуска: </span>
              <span className="text-muted-foreground">{selectedVehicle.yearOfManufacture}</span>
            </div>
          )}
          
          {selectedVehicle.technicalCertificate && (
            <div>
              <span className="font-medium">ПТС/СТС: </span>
              <span className="text-muted-foreground">{selectedVehicle.technicalCertificate}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
