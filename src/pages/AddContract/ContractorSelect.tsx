import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contractor } from '@/api/contractors';

interface ContractorSelectProps {
  label: string;
  placeholder: string;
  role: 'buyer' | 'carrier' | 'seller';
  contractors: Contractor[];
  loadingData: boolean;
  selectedId?: number;
  onSelect: (contractor: Contractor) => void;
  showDetails?: boolean;
  showAddressSelect?: boolean;
  selectedAddress?: string;
  onSelectAddress?: (address: string) => void;
}

export default function ContractorSelect({
  label,
  placeholder,
  role,
  contractors,
  loadingData,
  selectedId,
  onSelect,
  showDetails = false,
  showAddressSelect = false,
  selectedAddress,
  onSelectAddress
}: ContractorSelectProps) {
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
      const selected = contractors.find(c => c.id === selectedId);
      if (selected) {
        setSearch(selected.name);
      }
    }
  }, [selectedId, contractors]);

  const getFilteredContractors = () => {
    return contractors.filter(c => {
      const matchesRole = role === 'buyer' ? c.isBuyer : role === 'carrier' ? c.isCarrier : c.isSeller;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  };

  const handleSelect = (contractor: Contractor) => {
    onSelect(contractor);
    setSearch(contractor.name);
    setShowList(false);
  };

  const selectedContractor = selectedId ? contractors.find(c => c.id === selectedId) : undefined;
  const roleText = role === 'buyer' ? 'Покупатель' : role === 'carrier' ? 'Перевозчик' : 'Продавец';

  return (
    <>
      <div className="space-y-2 relative" data-dropdown>
        <Label>{label}</Label>
        <Input 
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowList(true);
          }}
          onFocus={() => setShowList(true)}
        />
        {showList && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto" data-dropdown>
            {loadingData ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Загрузка...</div>
            ) : getFilteredContractors().length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Контрагенты с ролью "{roleText}" не найдены
              </div>
            ) : (
              getFilteredContractors().map((contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => handleSelect(contractor)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium">{contractor.name}</div>
                  {showDetails && contractor.actualAddress && (
                    <div className="text-xs text-muted-foreground truncate">{contractor.actualAddress}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {showDetails && selectedContractor && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
          <div>
            <span className="font-medium">Адрес: </span>
            <span className="text-muted-foreground">
              {selectedContractor.actualAddress || selectedContractor.legalAddress || 'Не указан'}
            </span>
          </div>
          {selectedContractor.deliveryAddresses && selectedContractor.deliveryAddresses.length > 0 && (
            <div>
              <span className="font-medium">Контакты: </span>
              <span className="text-muted-foreground">
                {selectedContractor.deliveryAddresses.map(da => `${da.contact} ${da.phone}`).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
      
      {showAddressSelect && selectedContractor && (
        <div className="space-y-2">
          <Label>Адрес {role === 'seller' ? 'погрузки' : 'разгрузки'}</Label>
          <div className="space-y-2">
            {/* Только дополнительные адреса доставки */}
            {selectedContractor.deliveryAddresses && selectedContractor.deliveryAddresses.length > 0 ? (
              selectedContractor.deliveryAddresses.map((da, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectAddress?.(da.address)}
                  className={`w-full p-3 text-left border rounded-lg hover:bg-gray-50 text-sm ${
                    selectedAddress === da.address
                      ? 'border-[#0ea5e9] bg-blue-50'
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium text-foreground">{da.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {da.contact} • {da.phone}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center border border-dashed rounded-lg">
                Нет добавленных адресов {role === 'seller' ? 'погрузки' : 'разгрузки'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}