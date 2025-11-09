import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private sentry: any = null;
  private initialized = false;

  async init() {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn || this.initialized) return;
    try {
      const moduleName = '@sentry/node';
      const mod: any = await import(moduleName as any).catch(() => null);
      if (!mod) return;
      mod.init({
        dsn,
        environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.0'),
      });
      this.sentry = mod;
      this.initialized = true;
    } catch {
      // ignore if not available
    }
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    if (!this.initialized || !this.sentry) return;
    try {
      this.sentry.captureException(error, { extra: context });
    } catch {
      // ignore
    }
  }
}