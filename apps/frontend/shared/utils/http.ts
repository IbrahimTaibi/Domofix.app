import { trackError } from './error-tracking'
import { AppHttpError, BackendErrorPayload } from './error-types'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = RequestInit & {
  retryOnUnauthorized?: boolean
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json')
}

function parseBackendError(body: any): BackendErrorPayload {
  if (!body || typeof body !== 'object') return {}
  const { errorId, type, statusCode, message, timestamp, path, details } = body
  return { errorId, type, statusCode, message, timestamp, path, details }
}

export async function httpRequest<T>(url: string, opts: RequestOptions = {}): Promise<T> {
  const cfg: RequestInit = { ...opts }
  const lc = cfg.headers ? new Headers(cfg.headers as any) : new Headers()
  if (!lc.has('Accept')) lc.set('Accept', 'application/json')
  cfg.headers = lc

  try {
    const res = await fetch(url, cfg)
    if (!res.ok) {
      let payload: BackendErrorPayload | undefined
      if (isJsonResponse(res)) {
        try {
          const body = await res.json()
          payload = parseBackendError(body)
        } catch {}
      }
      const message = payload?.message || `HTTP ${res.status}`
      const err = new AppHttpError(message, res.status, payload)
      trackError(err, { source: 'http', url, method: (cfg.method || 'GET').toString() })
      throw err
    }
    if (isJsonResponse(res)) {
      return (await res.json()) as T
    }
    // @ts-expect-error non-json responses are not expected for API calls
    return undefined
  } catch (err) {
    // Network and unexpected errors
    const isNetwork = err instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine)
    const wrapped = isNetwork ? new AppHttpError('Network error', 0) : (err as any)
    trackError(wrapped, { source: 'http-catch', url, method: (cfg.method || 'GET').toString(), online: typeof navigator !== 'undefined' ? navigator.onLine : undefined })
    throw wrapped
  }
}