import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VehicleInfoSectionProps {
  brand: string;
  setBrand: (value: string) => void;
  registrationNumber: string;
  setRegistrationNumber: (value: string) => void;
  capacity: string;
  setCapacity: (value: string) => void;
  trailerNumber: string;
  setTrailerNumber: (value: string) => void;
  trailerType: string;
  setTrailerType: (value: string) => void;
}

function VehicleInfoSection({
  brand,
  setBrand,
  registrationNumber,
  setRegistrationNumber,
  capacity,
  setCapacity,
  trailerNumber,
  setTrailerNumber,
  trailerType,
  setTrailerType
}: VehicleInfoSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Car" size={20} className="text-[#0ea5e9]" />
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Транспортное средство</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Марка ТС *</Label>
          <Input 
            id="brand" 
            placeholder="КамАЗ 5320" 
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Номер ТС *</Label>
          <Input 
            id="registrationNumber" 
            placeholder="А123БВ777"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Грузоподъемность (тонн)</Label>
          <Input 
            id="capacity" 
            type="number"
            placeholder="20"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            step="0.1"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trailerNumber">Номер прицепа</Label>
          <Input 
            id="trailerNumber" 
            placeholder="В456ГД777"
            value={trailerNumber}
            onChange={(e) => setTrailerNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trailerType">Тип прицепа</Label>
          <Input 
            id="trailerType" 
            placeholder="рефрижератор, тент, борт и т.д."
            value={trailerType}
            onChange={(e) => setTrailerType(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default VehicleInfoSection;
