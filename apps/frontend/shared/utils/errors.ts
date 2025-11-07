export class HttpError extends Error {
  statusCode: number
  details?: { message?: string; statusCode?: number; error?: string }
  constructor(message: string, statusCode: number, details?: { message?: string; statusCode?: number; error?: string }) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.details = details
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof Error && (err as any).name === 'HttpError' && typeof (err as any).statusCode === 'number'
}