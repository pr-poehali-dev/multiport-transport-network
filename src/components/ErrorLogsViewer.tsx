import { useState } from 'react';
import { errorLogger } from '@/utils/errorLogger';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

function ErrorLogsViewer() {
  const { toast } = useToast();
  const [logs, setLogs] = useState(errorLogger.getLogs());
  const [open, setOpen] = useState(false);

  const refreshLogs = () => {
    setLogs(errorLogger.getLogs());
  };

  const handleCopyLogs = () => {
    const summary = errorLogger.getLogsSummary();
    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: 'Скопировано!',
        description: 'Логи скопированы в буфер обмена. Отправьте их в поддержку poehali.dev',
      });
    });
  };

  const handleClearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
    toast({
      title: 'Логи очищены',
      description: 'Все логи ошибок удалены',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={refreshLogs}
        >
          <Icon name="Bug" size={20} />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Bug" size={24} />
            Логи ошибок для поддержки poehali.dev
          </DialogTitle>
          <DialogDescription>
            Эти логи помогут команде poehali.dev диагностировать проблемы. 
            Скопируйте и отправьте их в поддержку при обращении.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button onClick={handleCopyLogs} className="gap-2">
            <Icon name="Copy" size={16} />
            Скопировать для поддержки
          </Button>
          <Button onClick={handleClearLogs} variant="outline" className="gap-2">
            <Icon name="Trash2" size={16} />
            Очистить логи
          </Button>
          <Button onClick={refreshLogs} variant="outline" className="gap-2">
            <Icon name="RefreshCw" size={16} />
            Обновить
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-4 bg-gray-50">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-2 text-green-500" />
              <p>Ошибок не обнаружено</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(log.severity)}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold uppercase text-xs">
                    {log.severity}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="font-medium mb-1">{log.message}</div>
                {log.stack && (
                  <details className="text-xs opacity-70 mt-2">
                    <summary className="cursor-pointer hover:opacity-100">Stack trace</summary>
                    <pre className="mt-1 overflow-x-auto">{log.stack}</pre>
                  </details>
                )}
                <div className="text-xs opacity-70 mt-1">
                  <div>URL: {log.url}</div>
                  {log.context && (
                    <details className="mt-1">
                      <summary className="cursor-pointer hover:opacity-100">Контекст</summary>
                      <pre className="mt-1 overflow-x-auto">{JSON.stringify(log.context, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Всего записей: {logs.length} | Ошибок: {logs.filter(l => l.severity === 'error').length} | 
          Предупреждений: {logs.filter(l => l.severity === 'warning').length}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorLogsViewer;
