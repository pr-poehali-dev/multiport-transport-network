import { useEffect } from 'react';
import { getContractors, Contractor } from '@/api/contractors';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/api/orders';
import { Consignee } from './types';

interface UseContractorsDataProps {
  consignees: Consignee[];
  contractors: Contractor[];
  setContractors: (contractors: Contractor[]) => void;
  loadingContractors: boolean;
  setLoadingContractors: (loading: boolean) => void;
  setSearchConsignee: (setter: (prev: Record<string, string>) => Record<string, string>) => void;
  setShowConsigneeList: (setter: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  isEditMode: boolean;
  order?: Order;
}

export function useContractorsData({
  consignees,
  contractors,
  setContractors,
  loadingContractors,
  setLoadingContractors,
  setSearchConsignee,
  setShowConsigneeList,
  isEditMode,
  order
}: UseContractorsDataProps) {
  const { toast } = useToast();

  const loadContractorsList = async () => {
    if (loadingContractors || contractors.length > 0) return;
    
    setLoadingContractors(true);
    try {
      const response = await getContractors();
      setContractors(response.contractors || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список контрагентов',
        variant: 'destructive'
      });
    } finally {
      setLoadingContractors(false);
    }
  };

  const getFilteredContractors = (consigneeId: string, searchConsignee: Record<string, string>) => {
    const search = searchConsignee[consigneeId]?.toLowerCase() || '';
    return contractors.filter(c => 
      c.isBuyer && c.name.toLowerCase().includes(search)
    );
  };

  useEffect(() => {
    if (consignees.length > 0 && contractors.length === 0) {
      loadContractorsList();
    }
  }, [consignees.length]);

  useEffect(() => {
    if (isEditMode && order && contractors.length > 0) {
      const newSearchConsignee: Record<string, string> = {};
      order.consignees.forEach((consignee) => {
        newSearchConsignee[consignee.id?.toString() || ''] = consignee.name;
      });
      setSearchConsignee(() => newSearchConsignee);
    }
  }, [isEditMode, order, contractors]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      const consigneeInputs = document.querySelectorAll('[data-consignee-id]');
      consigneeInputs.forEach((input) => {
        const consigneeId = input.getAttribute('data-consignee-id');
        if (consigneeId && !input.parentElement?.contains(target)) {
          setShowConsigneeList(prev => ({ ...prev, [consigneeId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    loadContractorsList,
    getFilteredContractors
  };
}
