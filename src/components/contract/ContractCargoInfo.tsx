import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Contractor } from '@/api/contractors';

interface ContractCargoInfoProps {
  cargo: string;
  setCargo: (value: string) => void;
  
  loadingSellerId: number | undefined;
  searchLoadingSeller: string;
  setSearchLoadingSeller: (value: string) => void;
  showLoadingSellerList: boolean;
  setShowLoadingSellerList: (value: boolean) => void;
  handleSelectLoadingSeller: (contractor: Contractor) => void;
  filteredLoadingSellers: Contractor[];
  
  loadingDate: string;
  setLoadingDate: (value: string) => void;
  
  unloadingBuyerId: number | undefined;
  searchUnloadingBuyer: string;
  setSearchUnloadingBuyer: (value: string) => void;
  showUnloadingBuyerList: boolean;
  setShowUnloadingBuyerList: (value: boolean) => void;
  handleSelectUnloadingBuyer: (contractor: Contractor) => void;
  filteredUnloadingBuyers: Contractor[];
  
  unloadingDate: string;
  setUnloadingDate: (value: string) => void;
}

export default function ContractCargoInfo({
  cargo,
  setCargo,
  loadingSellerId,
  searchLoadingSeller,
  setSearchLoadingSeller,
  showLoadingSellerList,
  setShowLoadingSellerList,
  handleSelectLoadingSeller,
  filteredLoadingSellers,
  loadingDate,
  setLoadingDate,
  unloadingBuyerId,
  searchUnloadingBuyer,
  setSearchUnloadingBuyer,
  showUnloadingBuyerList,
  setShowUnloadingBuyerList,
  handleSelectUnloadingBuyer,
  filteredUnloadingBuyers,
  unloadingDate,
  setUnloadingDate
}: ContractCargoInfoProps) {
  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="Package" size={20} className="text-[#0ea5e9]" />
        Информация о грузе
      </h2>

      <div>
        <Label htmlFor="cargo">Груз</Label>
        <Textarea
          id="cargo"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          placeholder="Описание груза..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Погрузка</h3>
          
          <div className="relative" data-dropdown>
            <Label htmlFor="loadingSeller">Продавец (грузоотправитель)</Label>
            <Input
              id="loadingSeller"
              value={searchLoadingSeller}
              onChange={(e) => {
                setSearchLoadingSeller(e.target.value);
                setShowLoadingSellerList(true);
              }}
              onFocus={() => setShowLoadingSellerList(true)}
              placeholder="Поиск продавца..."
            />
            {showLoadingSellerList && filteredLoadingSellers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredLoadingSellers.map((contractor) => (
                  <div
                    key={contractor.id}
                    onClick={() => handleSelectLoadingSeller(contractor)}
                    className="px-4 py-2 hover:bg-[#0ea5e9]/10 cursor-pointer text-sm"
                  >
                    {contractor.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="loadingDate">Дата погрузки</Label>
            <Input
              id="loadingDate"
              type="date"
              value={loadingDate}
              onChange={(e) => setLoadingDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Разгрузка</h3>
          
          <div className="relative" data-dropdown>
            <Label htmlFor="unloadingBuyer">Покупатель (грузополучатель)</Label>
            <Input
              id="unloadingBuyer"
              value={searchUnloadingBuyer}
              onChange={(e) => {
                setSearchUnloadingBuyer(e.target.value);
                setShowUnloadingBuyerList(true);
              }}
              onFocus={() => setShowUnloadingBuyerList(true)}
              placeholder="Поиск покупателя..."
            />
            {showUnloadingBuyerList && filteredUnloadingBuyers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredUnloadingBuyers.map((contractor) => (
                  <div
                    key={contractor.id}
                    onClick={() => handleSelectUnloadingBuyer(contractor)}
                    className="px-4 py-2 hover:bg-[#0ea5e9]/10 cursor-pointer text-sm"
                  >
                    {contractor.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="unloadingDate">Дата разгрузки</Label>
            <Input
              id="unloadingDate"
              type="date"
              value={unloadingDate}
              onChange={(e) => setUnloadingDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
