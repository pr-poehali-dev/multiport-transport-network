interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  projectId?: string;
  severity: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 100;
  private readonly STORAGE_KEY = 'poehali_error_logs';

  private constructor() {
    this.loadLogs();
    this.setupGlobalErrorHandler();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'error',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'error',
      });
    });
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load error logs from localStorage');
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to save error logs to localStorage');
    }
  }

  logError(params: {
    message: string;
    stack?: string;
    severity?: 'error' | 'warning' | 'info';
    context?: Record<string, any>;
  }) {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      message: params.message,
      stack: params.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: params.severity || 'error',
      context: params.context,
    };

    this.logs.unshift(log);

    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    this.saveLogs();

    console.error('[ErrorLogger]', log);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getLogsSummary(): string {
    const total = this.logs.length;
    const errors = this.logs.filter(l => l.severity === 'error').length;
    const warnings = this.logs.filter(l => l.severity === 'warning').length;
    
    return `=== POEHALI.DEV ERROR LOGS ===
Всего записей: ${total}
Ошибок: ${errors}
Предупреждений: ${warnings}

Последние 10 записей:
${this.logs.slice(0, 10).map((log, idx) => 
  `${idx + 1}. [${log.severity.toUpperCase()}] ${log.timestamp}
   ${log.message}
   URL: ${log.url}
   ${log.stack ? `Stack: ${log.stack.split('\n')[0]}` : ''}
`).join('\n')}

Полный лог (JSON):
${this.exportLogs()}
`;
  }
}

export const errorLogger = ErrorLogger.getInstance();

export function logError(message: string, error?: Error, context?: Record<string, any>) {
  errorLogger.logError({
    message,
    stack: error?.stack,
    severity: 'error',
    context,
  });
}

export function logWarning(message: string, context?: Record<string, any>) {
  errorLogger.logError({
    message,
    severity: 'warning',
    context,
  });
}

export function logInfo(message: string, context?: Record<string, any>) {
  errorLogger.logError({
    message,
    severity: 'info',
    context,
  });
}
