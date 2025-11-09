export type AppErrorType =
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'NotFoundError'
  | 'RateLimitError'
  | 'DatabaseError'
  | 'InternalError';

export interface BackendErrorPayload {
  errorId?: string;
  type?: AppErrorType | string;
  statusCode?: number;
  message?: string;
  timestamp?: string;
  path?: string;
  details?: any;
}

export class AppHttpError extends Error {
  readonly statusCode: number;
  readonly type: AppErrorType | 'UnknownError';
  readonly errorId?: string;
  readonly payload?: BackendErrorPayload;

  constructor(message: string, statusCode: number, payload?: BackendErrorPayload) {
    super(message);
    this.name = 'AppHttpError';
    this.statusCode = statusCode;
    const t = (payload?.type as AppErrorType | undefined) ?? 'InternalError';
    this.type = (t as AppErrorType) || 'UnknownError';
    this.errorId = payload?.errorId;
    this.payload = payload;
  }
}

export function isAppHttpError(err: unknown): err is AppHttpError {
  return (
    err instanceof Error &&
    (err as any).name === 'AppHttpError' &&
    typeof (err as any).statusCode === 'number'
  );
}