import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export function SyncBackendButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // Вызываем внутренний API poehali.dev для синхронизации бэкенда
      const response = await fetch('/api/sync-backend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось синхронизировать бэкенд');
      }

      const result = await response.json();
      
      toast({
        title: 'Бэкенд обновлён',
        description: `Задеплоено функций: ${result.deployed?.length || 0}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка синхронизации',
        description: error instanceof Error ? error.message : 'Не удалось обновить бэкенд',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isSyncing ? (
        <>
          <Icon name="Loader2" size={16} className="animate-spin" />
          Синхронизация...
        </>
      ) : (
        <>
          <Icon name="RefreshCw" size={16} />
          Sync Backend
        </>
      )}
    </Button>
  );
}

export default SyncBackendButton;
