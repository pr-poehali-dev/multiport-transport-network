interface PlatformErrorLog {
  timestamp: string;
  message: string;
  category: 'sync_backend' | 'file_system' | 'database' | 'deployment' | 'build' | 'api' | 'storage' | 'secrets' | 'other';
  severity: 'critical' | 'error' | 'warning';
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
  projectUrl: string;
}

class PlatformLogger {
  private static instance: PlatformLogger;
  private logs: PlatformErrorLog[] = [];
  private readonly MAX_LOGS = 200;
  private readonly STORAGE_KEY = 'poehali_platform_issues';

  private constructor() {
    this.loadLogs();
  }

  static getInstance(): PlatformLogger {
    if (!PlatformLogger.instance) {
      PlatformLogger.instance = new PlatformLogger();
    }
    return PlatformLogger.instance;
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[PlatformLogger] Failed to load logs');
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('[PlatformLogger] Failed to save logs');
    }
  }

  logPlatformIssue(params: {
    message: string;
    category: PlatformErrorLog['category'];
    severity?: PlatformErrorLog['severity'];
    stack?: string;
    context?: Record<string, any>;
  }) {
    const log: PlatformErrorLog = {
      timestamp: new Date().toISOString(),
      message: params.message,
      category: params.category,
      severity: params.severity || 'error',
      stack: params.stack,
      context: params.context,
      userAgent: navigator.userAgent,
      projectUrl: window.location.href,
    };

    this.logs.unshift(log);

    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    this.saveLogs();

    console.error('[POEHALI.DEV PLATFORM ISSUE]', log);
  }

  getLogs(): PlatformErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  exportForSupport(): string {
    const total = this.logs.length;
    const critical = this.logs.filter(l => l.severity === 'critical').length;
    const errors = this.logs.filter(l => l.severity === 'error').length;
    const warnings = this.logs.filter(l => l.severity === 'warning').length;

    const categoryStats = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `=== ОТЧЁТ О ПРОБЛЕМАХ ПЛАТФОРМЫ POEHALI.DEV ===

📊 Статистика:
- Всего проблем: ${total}
- Критических: ${critical}
- Ошибок: ${errors}
- Предупреждений: ${warnings}

📁 По категориям:
${Object.entries(categoryStats)
  .map(([cat, count]) => `- ${cat}: ${count}`)
  .join('\n')}

🕐 Период: ${this.logs[this.logs.length - 1]?.timestamp || 'N/A'} — ${this.logs[0]?.timestamp || 'N/A'}

---

📋 ПОСЛЕДНИЕ 15 ПРОБЛЕМ:

${this.logs.slice(0, 15).map((log, idx) => {
  return `${idx + 1}. [${log.severity.toUpperCase()}] [${log.category}]
   Время: ${new Date(log.timestamp).toLocaleString('ru-RU')}
   Проблема: ${log.message}
   URL: ${log.projectUrl}
   ${log.context ? `Контекст: ${JSON.stringify(log.context)}` : ''}
   ${log.stack ? `Stack: ${log.stack.split('\n').slice(0, 3).join('\n   ')}` : ''}
`;
}).join('\n---\n')}

📦 ПОЛНЫЙ JSON ДЛЯ РАЗРАБОТЧИКОВ:
${JSON.stringify(this.logs, null, 2)}

---
Отправьте этот отчёт в поддержку: t.me/+QgiLIa1gFRY4Y2Iy
`;
  }

  hasIssues(): boolean {
    return this.logs.length > 0;
  }

  getIssueCount(): number {
    return this.logs.length;
  }
}

export const platformLogger = PlatformLogger.getInstance();

export function logPlatformError(
  message: string,
  category: PlatformErrorLog['category'],
  context?: Record<string, any>,
  error?: Error
) {
  platformLogger.logPlatformIssue({
    message,
    category,
    severity: 'error',
    stack: error?.stack,
    context,
  });
}

export function logPlatformCritical(
  message: string,
  category: PlatformErrorLog['category'],
  context?: Record<string, any>,
  error?: Error
) {
  platformLogger.logPlatformIssue({
    message,
    category,
    severity: 'critical',
    stack: error?.stack,
    context,
  });
}

export function logPlatformWarning(
  message: string,
  category: PlatformErrorLog['category'],
  context?: Record<string, any>
) {
  platformLogger.logPlatformIssue({
    message,
    category,
    severity: 'warning',
    context,
  });
}
