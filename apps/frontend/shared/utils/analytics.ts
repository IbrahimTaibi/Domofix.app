export interface AnalyticsEvent {
  name: string
  props?: Record<string, any>
}

export async function trackEvent(name: string, props?: Record<string, any>) {
  try {
    const payload: AnalyticsEvent = { name, props: { ...(props || {}), url: typeof window !== 'undefined' ? window.location.pathname : undefined, ts: Date.now() } }
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_URL
    if (endpoint) {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      // Fallback: console log
      // eslint-disable-next-line no-console
      console.log('[Analytics]', payload)
    }
  } catch {}
}