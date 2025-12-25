import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface DeliveryAddress {
  id: string;
  address: string;
  phone: string;
  contact: string;
}

interface AddressesSectionProps {
  legalAddress: string;
  setLegalAddress: (value: string) => void;
  showActualAddress: boolean;
  setShowActualAddress: (value: boolean) => void;
  actualAddress: string;
  setActualAddress: (value: string) => void;
  actualSameAsLegal: boolean;
  setActualSameAsLegal: (value: boolean) => void;
  showPostalAddress: boolean;
  setShowPostalAddress: (value: boolean) => void;
  postalAddress: string;
  setPostalAddress: (value: string) => void;
  postalSameAsLegal: boolean;
  setPostalSameAsLegal: (value: boolean) => void;
  deliveryAddresses: DeliveryAddress[];
  handleAddDeliveryAddress: () => void;
  handleRemoveDeliveryAddress: (id: string) => void;
  handleUpdateDeliveryAddress: (id: string, field: keyof DeliveryAddress, value: string) => void;
}

function AddressesSection({
  legalAddress,
  setLegalAddress,
  showActualAddress,
  setShowActualAddress,
  actualAddress,
  setActualAddress,
  actualSameAsLegal,
  setActualSameAsLegal,
  showPostalAddress,
  setShowPostalAddress,
  postalAddress,
  setPostalAddress,
  postalSameAsLegal,
  setPostalSameAsLegal,
  deliveryAddresses,
  handleAddDeliveryAddress,
  handleRemoveDeliveryAddress,
  handleUpdateDeliveryAddress
}: AddressesSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Icon name="MapPin" size={20} className="text-[#0ea5e9]" />
        <h2 className="text-base lg:text-lg font-semibold text-foreground">Адреса</h2>
      </div>
      
      {/* Юридический адрес */}
      <div className="space-y-2">
        <Label htmlFor="legalAddress" className="font-semibold">Юридический адрес</Label>
        <Input 
          id="legalAddress" 
          placeholder="111024, Город Москва, вн.тер. г. Муниципальный Округ Лефортово..."
          value={legalAddress}
          onChange={(e) => setLegalAddress(e.target.value)}
        />
      </div>

      {/* Фактический адрес */}
      {!showActualAddress ? (
        <button
          onClick={() => setShowActualAddress(true)}
          className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="Plus" size={18} />
          <span>Добавить фактический адрес</span>
        </button>
      ) : (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="font-semibold">Фактический адрес</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="actualSameAsLegal"
                  checked={actualSameAsLegal}
                  onCheckedChange={(checked) => {
                    setActualSameAsLegal(checked as boolean);
                    if (checked) {
                      setActualAddress(legalAddress);
                    }
                  }}
                />
                <Label 
                  htmlFor="actualSameAsLegal"
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                >
                  совпадает с юридическим
                </Label>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowActualAddress(false);
                setActualAddress('');
                setActualSameAsLegal(false);
              }}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <Input 
            id="actualAddress" 
            placeholder="Введите фактический адрес"
            value={actualAddress}
            onChange={(e) => {
              setActualAddress(e.target.value);
              setActualSameAsLegal(false);
            }}
            disabled={actualSameAsLegal}
          />
        </div>
      )}

      {/* Почтовый адрес */}
      {!showPostalAddress ? (
        <button
          onClick={() => setShowPostalAddress(true)}
          className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="Plus" size={18} />
          <span>Добавить почтовый адрес</span>
        </button>
      ) : (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="font-semibold">Почтовый адрес</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="postalSameAsLegal"
                  checked={postalSameAsLegal}
                  onCheckedChange={(checked) => {
                    setPostalSameAsLegal(checked as boolean);
                    if (checked) {
                      setPostalAddress(legalAddress);
                    }
                  }}
                />
                <Label 
                  htmlFor="postalSameAsLegal"
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                >
                  совпадает с юридическим
                </Label>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowPostalAddress(false);
                setPostalAddress('');
                setPostalSameAsLegal(false);
              }}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <Input 
            id="postalAddress" 
            placeholder="Введите почтовый адрес"
            value={postalAddress}
            onChange={(e) => {
              setPostalAddress(e.target.value);
              setPostalSameAsLegal(false);
            }}
            disabled={postalSameAsLegal}
          />
        </div>
      )}

      {/* Адреса погрузки/разгрузки */}
      {deliveryAddresses.length > 0 && deliveryAddresses.map((delivery) => (
        <div key={delivery.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Адрес погрузки/разгрузки</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveDeliveryAddress(delivery.id)}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <Input 
            placeholder="Введите адрес погрузки/разгрузки"
            value={delivery.address}
            onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'address', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input 
              placeholder="+7 (999) 123-45-67"
              value={delivery.phone}
              onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'phone', e.target.value)}
            />
            <Input 
              placeholder="ФИО контактного лица"
              value={delivery.contact}
              onChange={(e) => handleUpdateDeliveryAddress(delivery.id, 'contact', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={handleAddDeliveryAddress}
        className="w-full rounded-lg border border-dashed border-border p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="Plus" size={18} />
        <span>Добавить адрес погрузки/разгрузки</span>
      </button>
    </div>
  );
}

export default AddressesSection;
