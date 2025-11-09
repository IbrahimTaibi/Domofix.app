import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  // Default to online to avoid false negatives from unreliable navigator.onLine
  const [online, setOnline] = useState<boolean>(true)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onOnline)
        window.removeEventListener('offline', onOffline)
      }
    }
  }, [])

  return { online }
}