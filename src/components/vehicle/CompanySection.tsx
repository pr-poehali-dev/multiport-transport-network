import { RefObject } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contractor } from '@/api/contractors';

interface CompanySectionProps {
  showCompany: boolean;
  setShowCompany: (value: boolean) => void;
  searchContractor: string;
  setSearchContractor: (value: string) => void;
  showContractorList: boolean;
  setShowContractorList: (value: boolean) => void;
  contractors: Contractor[];
  loadingContractors: boolean;
  contractorInputRef: RefObject<HTMLInputElement>;
  contractorSectionRef?: RefObject<HTMLDivElement>;
  setCompanyId: (value: string) => void;
}

function CompanySection({
  showCompany,
  setShowCompany,
  searchContractor,
  setSearchContractor,
  showContractorList,
  setShowContractorList,
  contractors,
  loadingContractors,
  contractorInputRef,
  contractorSectionRef,
  setCompanyId
}: CompanySectionProps) {
  if (!showCompany) {
    return (
      <div ref={contractorSectionRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCompany(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Icon name="Plus" size={20} />
          <span>Добавить фирму ТК</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={contractorSectionRef} className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Building2" size={20} className="text-[#0ea5e9]" />
          <h2 className="text-base lg:text-lg font-semibold text-foreground">Фирма ТК</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowCompany(false);
            setCompanyId('');
          }}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="Trash2" size={18} />
        </Button>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="contractor">Фирма ТК</Label>
        <div className="relative" ref={contractorInputRef}>
          <Input
            id="contractor"
            placeholder="Начните вводить название фирмы..."
            value={searchContractor}
            onChange={(e) => {
              setSearchContractor(e.target.value);
              setShowContractorList(true);
            }}
            onFocus={() => setShowContractorList(true)}
          />
          {loadingContractors && (
            <Icon name="Loader2" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          
          {showContractorList && contractors.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {contractors
                .filter(c => c.isCarrier && c.name.toLowerCase().includes(searchContractor.toLowerCase()))
                .map(contractor => (
                  <button
                    key={contractor.id}
                    type="button"
                    onClick={() => {
                      setCompanyId(contractor.id?.toString() || '');
                      setSearchContractor(contractor.name);
                      setShowContractorList(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-border last:border-0"
                  >
                    <Icon name="Building2" size={18} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contractor.name}</p>
                      {contractor.inn && (
                        <p className="text-xs text-muted-foreground">ИНН: {contractor.inn}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanySection;