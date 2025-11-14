import { Injectable, Logger } from '@nestjs/common';
import { redact } from '@/common/utils/redact.util';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('App');
  private readonly levelOrder: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };
  private readonly currentLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) || 'info';
  private readonly isProd = process.env.NODE_ENV === 'production';

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder[level] <= this.levelOrder[this.currentLevel];
  }

  error(message: string, context?: Record<string, unknown>, trace?: string) {
    if (!this.shouldLog('error')) return;
    this.logger.error(message, trace, this.formatContext(context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('warn')) return;
    this.logger.warn(message, this.formatContext(context));
  }

  info(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('info')) return;
    this.logger.log(message, this.formatContext(context));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('debug')) return;
    if (this.isProd) return; // never debug in prod
    this.logger.debug(message, this.formatContext(context));
  }

  private formatContext(context?: Record<string, unknown>): string | undefined {
    if (!context) return undefined;
    try {
      return JSON.stringify(redact(context));
    } catch {
      return undefined;
    }
  }
}
