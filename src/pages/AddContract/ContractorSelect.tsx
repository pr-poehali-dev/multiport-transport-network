import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
  selectedAddresses?: string[];
  onSelectAddresses?: (addresses: string[]) => void;
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
  selectedAddresses = [],
  onSelectAddresses
}: ContractorSelectProps) {
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]') && !target.closest('[data-address-dropdown]')) {
        setShowList(false);
        setShowAddressList(false);
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
        <div className="space-y-2 relative" data-address-dropdown>
          <Label>Адрес {role === 'seller' ? 'погрузки' : 'разгрузки'}</Label>
          
          {/* Поле выбора */}
          <div 
            className="min-h-[40px] p-2 border border-border rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setShowAddressList(!showAddressList)}
          >
            {selectedAddresses.length === 0 ? (
              <span className="text-muted-foreground text-sm">Выберите адреса</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedAddresses.map((addr, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {addr.length > 40 ? `${addr.substring(0, 40)}...` : addr}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAddresses?.(selectedAddresses.filter(a => a !== addr));
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Выпадающий список */}
          {showAddressList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto" data-address-dropdown>
              {selectedContractor.deliveryAddresses && selectedContractor.deliveryAddresses.length > 0 ? (
                <div className="p-2 space-y-1">
                  {selectedContractor.deliveryAddresses.map((da, index) => {
                    const isChecked = selectedAddresses.includes(da.address);
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => {
                          if (isChecked) {
                            onSelectAddresses?.(selectedAddresses.filter(a => a !== da.address));
                          } else {
                            onSelectAddresses?.([...selectedAddresses, da.address]);
                          }
                        }}
                      >
                        <Checkbox checked={isChecked} className="mt-1" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium text-foreground">{da.address}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {da.contact} • {da.phone}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Нет добавленных адресов
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}