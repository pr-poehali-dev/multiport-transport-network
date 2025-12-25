import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface BasicInfoSectionProps {
  name: string;
  setName: (value: string) => void;
  isSeller: boolean;
  setIsSeller: (value: boolean) => void;
  isBuyer: boolean;
  setIsBuyer: (value: boolean) => void;
  isCarrier: boolean;
  setIsCarrier: (value: boolean) => void;
  inn: string;
  setInn: (value: string) => void;
  kpp: string;
  setKpp: (value: string) => void;
  ogrn: string;
  setOgrn: (value: string) => void;
  director: string;
  setDirector: (value: string) => void;
}

function BasicInfoSection({
  name,
  setName,
  isSeller,
  setIsSeller,
  isBuyer,
  setIsBuyer,
  isCarrier,
  setIsCarrier,
  inn,
  setInn,
  kpp,
  setKpp,
  ogrn,
  setOgrn,
  director,
  setDirector
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Building2" size={20} className="text-[#0ea5e9]" />
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Наименование *</Label>
        <Input 
          id="name" 
          placeholder="ООО «ФЛАУЭР МАСТЕР»" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Роль</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isSeller"
              checked={isSeller}
              onCheckedChange={(checked) => setIsSeller(checked as boolean)}
            />
            <Label 
              htmlFor="isSeller"
              className="text-sm font-normal cursor-pointer"
            >
              Продавец
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isBuyer"
              checked={isBuyer}
              onCheckedChange={(checked) => setIsBuyer(checked as boolean)}
            />
            <Label 
              htmlFor="isBuyer"
              className="text-sm font-normal cursor-pointer"
            >
              Покупатель
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isCarrier"
              checked={isCarrier}
              onCheckedChange={(checked) => setIsCarrier(checked as boolean)}
            />
            <Label 
              htmlFor="isCarrier"
              className="text-sm font-normal cursor-pointer"
            >
              Перевозчик
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inn">ИНН *</Label>
          <Input 
            id="inn" 
            placeholder="7724449594"
            value={inn}
            onChange={(e) => setInn(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kpp">КПП</Label>
          <Input 
            id="kpp" 
            placeholder="772201001"
            value={kpp}
            onChange={(e) => setKpp(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogrn">ОГРН</Label>
          <Input 
            id="ogrn" 
            placeholder="1187746741566"
            value={ogrn}
            onChange={(e) => setOgrn(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="director">ФИО руководителя</Label>
        <Input 
          id="director" 
          placeholder="Знаменский М.А"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
        />
      </div>
    </div>
  );
}

export default BasicInfoSection;
