export type TrackedError = {
  message?: string
  name?: string
  stack?: string
  statusCode?: number
}

function serializeError(err: unknown): TrackedError {
  if (err instanceof Error) {
    const anyErr = err as any
    return {
      message: err.message,
      name: err.name,
      stack: typeof err.stack === 'string' ? err.stack : undefined,
      statusCode: typeof anyErr?.statusCode === 'number' ? anyErr.statusCode : undefined,
    }
  }
  try {
    return { message: JSON.stringify(err) }
  } catch {
    return { message: String(err) }
  }
}

export async function trackError(err: unknown, context?: Record<string, any>) {
  const payload = {
    error: serializeError(err),
    context: context || {},
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ts: Date.now(),
    env: process.env.NODE_ENV,
  }

  // Always log to console for local visibility
  // eslint-disable-next-line no-console
  console.error('[Error tracked]', payload)

  // Optional remote tracking endpoint
  const endpoint = process.env.NEXT_PUBLIC_ERROR_TRACKING_URL
  if (endpoint && typeof fetch === 'function') {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Swallow tracking errors
    }
  }
}