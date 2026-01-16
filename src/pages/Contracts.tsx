import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TopBar from '@/components/TopBar';
import AddContract from './AddContract';
import PrintContractDialog from '@/components/contract/PrintContractDialog';
import { getContracts, deleteContract, Contract } from '@/api/contracts';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContractsProps {
  onMenuClick: () => void;
}

function Contracts({ onMenuClick }: ContractsProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [contractToPrint, setContractToPrint] = useState<Contract | null>(null);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await getContracts();
      setContracts(data.contracts);
      setFilteredContracts(data.contracts);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список договоров'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContracts(contracts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contracts.filter(contract => {
      const contractNumber = contract.contractNumber.toLowerCase();
      const customer = (contract.customerName || '').toLowerCase();
      const carrier = (contract.carrierName || '').toLowerCase();
      const cargo = (contract.cargo || '').toLowerCase();
      
      return contractNumber.includes(query) || 
             customer.includes(query) || 
             carrier.includes(query) ||
             cargo.includes(query);
    });

    setFilteredContracts(filtered);
  }, [searchQuery, contracts]);

  const handleRefresh = () => {
    loadContracts();
    toast({
      title: 'Обновлено',
      description: 'Список договоров-заявок обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setContractToEdit(null);
    loadContracts();
  };

  const handleEditContract = (contract: Contract) => {
    setContractToEdit(contract);
    setIsAdding(true);
  };

  const handleDeleteClick = (contractId: number) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handlePrintClick = (contract: Contract) => {
    setContractToPrint(contract);
    setPrintDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractToDelete) return;

    try {
      const result = await deleteContract(contractToDelete);
      
      toast({
        title: 'Договор удалён',
        description: result.message || 'Договор-заявка успешно удалён',
      });
      
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      loadContracts();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить договор'
      });
    }
  };

  if (isAdding) {
    return <AddContract onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Договор-Заявка"
        onMenuClick={onMenuClick}
        onRefresh={handleRefresh}
        rightButtons={
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
          >
            <Icon name="Plus" size={18} />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Поиск по номеру договора, заказчику..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={18} />
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            Найдено договоров: <span className="font-semibold text-foreground">{filteredContracts.length}</span>
          </p>
        )}

        {/* Список договоров */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет договоров-заявок'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
              >
                {/* Заголовок */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-[#0ea5e9]/10 rounded-full">
                    <Icon name="FileText" size={24} className="text-[#0ea5e9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {contract.contractNumber}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                          onClick={() => handlePrintClick(contract)}
                        >
                          <Icon name="Printer" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                          onClick={() => handleEditContract(contract)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteClick(contract.id!)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      от {new Date(contract.contractDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                {/* Информация */}
                <div className="space-y-2 text-sm">
                  {contract.customerName && (
                    <div className="flex items-start gap-2">
                      <Icon name="Building2" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Заказчик:</span>
                        <p className="font-medium truncate">{contract.customerName}</p>
                      </div>
                    </div>
                  )}
                  
                  {contract.cargo && (
                    <div className="flex items-start gap-2">
                      <Icon name="Package" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Груз:</span>
                        <p className="font-medium truncate">{contract.cargo}</p>
                      </div>
                    </div>
                  )}

                  {(contract.loadingAddresses && contract.loadingAddresses.length > 0) && (
                    <div className="flex items-start gap-2">
                      <Icon name="ArrowUpCircle" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Погрузка:</span>
                        <p className="text-xs truncate">{contract.loadingAddresses[0]}</p>
                        {contract.loadingAddresses.length > 1 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            +{contract.loadingAddresses.length - 1} ещё
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {(contract.unloadingAddresses && contract.unloadingAddresses.length > 0) && (
                    <div className="flex items-start gap-2">
                      <Icon name="ArrowDownCircle" size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Разгрузка:</span>
                        <p className="text-xs truncate">{contract.unloadingAddresses[0]}</p>
                        {contract.unloadingAddresses.length > 1 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            +{contract.unloadingAddresses.length - 1} ещё
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {contract.driverFullName && (
                    <div className="flex items-start gap-2">
                      <Icon name="UserCircle" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Водитель:</span>
                        <p className="font-medium truncate">{contract.driverFullName}</p>
                        {contract.driverPhone && (
                          <p className="text-xs text-muted-foreground">{contract.driverPhone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contract.vehicleRegistrationNumber && (
                    <div className="flex items-start gap-2">
                      <Icon name="Truck" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">ТС:</span>
                        <p className="font-medium">
                          {contract.vehicleRegistrationNumber}
                          {contract.vehicleTrailerNumber && ` / ${contract.vehicleTrailerNumber}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.paymentAmount && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Сумма:</span>
                      <span className="font-semibold text-[#0ea5e9]">
                        {contract.paymentAmount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы уверены, что хотите удалить этот договор-заявку? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrintContractDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        contractId={contractToPrint?.id || 0}
        contractNumber={contractToPrint?.contractNumber || ''}
      />
    </div>
  );
}

export default Contracts;