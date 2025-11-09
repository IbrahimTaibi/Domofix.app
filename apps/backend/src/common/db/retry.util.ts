import { backOff } from './simple-backoff';

export type RetryCondition = (err: any) => boolean;

const defaultCondition: RetryCondition = (err) => {
  const name = err?.name;
  const code = err?.code;
  return name === 'MongoNetworkError' || code === 91 || code === 'ETIMEDOUT' || code === 'ECONNRESET';
};

export async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3, condition: RetryCondition = defaultCondition): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!condition(err) || attempt === retries) throw err;
      await backOff(attempt);
      attempt++;
    }
  }
  throw lastErr;
}