import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TopBar from '@/components/TopBar';
import AddContractor from './AddContractor';
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
import { getContractors, deleteContractor, Contractor } from '@/api/contractors';

interface ContractorsProps {
  onMenuClick: () => void;
}

export type { Contractor };

function Contractors({ onMenuClick }: ContractorsProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [contractorToEdit, setContractorToEdit] = useState<Contractor | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<number | null>(null);

  const loadContractors = async () => {
    setIsLoading(true);
    try {
      const response = await getContractors();
      setContractors(response.contractors);
      setFilteredContractors(response.contractors);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список контрагентов'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContractors(contractors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contractors.filter(contractor => {
      const name = contractor.name.toLowerCase();
      const inn = (contractor.inn || '').toLowerCase();
      const kpp = (contractor.kpp || '').toLowerCase();
      const director = (contractor.director || '').toLowerCase();
      
      return name.includes(query) || 
             inn.includes(query) || 
             kpp.includes(query) ||
             director.includes(query);
    });

    setFilteredContractors(filtered);
  }, [searchQuery, contractors]);

  const handleRefresh = () => {
    loadContractors();
    toast({
      title: 'Обновлено',
      description: 'Список контрагентов обновлён'
    });
  };

  const handleBackFromAdd = () => {
    setIsAdding(false);
    setContractorToEdit(null);
    loadContractors();
  };

  const handleEditContractor = (contractor: Contractor) => {
    setContractorToEdit(contractor);
    setIsAdding(true);
  };

  const handleDeleteClick = (contractorId: number) => {
    setContractorToDelete(contractorId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractorToDelete) return;

    try {
      await deleteContractor(contractorToDelete);
      
      toast({
        title: 'Контрагент удалён',
        description: 'Контрагент успешно удалён из системы',
      });
      
      setDeleteDialogOpen(false);
      setContractorToDelete(null);
      loadContractors();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить контрагента'
      });
    }
  };

  if (isAdding) {
    return <AddContractor contractor={contractorToEdit || undefined} onBack={handleBackFromAdd} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Контрагенты"
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
              placeholder="Поиск по названию, ИНН, КПП, руководителю..."
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
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Найдено контрагентов: <span className="font-semibold text-foreground">{filteredContractors.length}</span>
            </p>
          )}
        </div>

        {/* Список контрагентов */}
        {isLoading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-[#0ea5e9]" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredContractors.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Building2" size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет контрагентов'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Попробуйте изменить запрос' : 'Нажмите "+ Добавить" для создания'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContractors.map((contractor) => {
              return (
                <div
                  key={contractor.id}
                  className="bg-white rounded-lg border border-border p-4 hover:border-[#0ea5e9] hover:shadow-md transition-all duration-200 group"
                >
                  {/* Заголовок */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0ea5e9]/10 rounded-full">
                      <Icon name="Building2" size={24} className="text-[#0ea5e9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {contractor.name}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9]"
                            onClick={() => handleEditContractor(contractor)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteClick(contractor.id!)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                      {contractor.inn && (
                        <p className="text-sm text-muted-foreground truncate">
                          ИНН: {contractor.inn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="space-y-2 text-sm">
                    {(contractor.isSeller || contractor.isBuyer || contractor.isCarrier) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {contractor.isSeller && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Продавец</span>
                        )}
                        {contractor.isBuyer && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Покупатель</span>
                        )}
                        {contractor.isCarrier && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Перевозчик</span>
                        )}
                      </div>
                    )}
                    {contractor.director && (
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{contractor.director}</span>
                      </div>
                    )}
                    {contractor.legalAddress && (
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{contractor.legalAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Вы действительно хотите удалить этого контрагента?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="X" size={16} />
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Contractors;