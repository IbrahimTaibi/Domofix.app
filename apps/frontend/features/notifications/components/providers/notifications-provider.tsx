"use client"

import { useEffect, useState } from 'react'
import { useNotificationsStream } from '@/shared/hooks/use-notifications'
import { useNotificationsSocketIO } from '@/shared/hooks/use-notifications-socketio'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const backendToken = useAuthStore((s) => s.backendToken)
  const [sseEnabled, setSseEnabled] = useState<boolean>(true)
  const failureCountRef = { current: 0 } as { current: number }
  const failureResetTimerRef = { current: null as number | null }

  // Initialize the SSE stream when authenticated
  const supportsWs = typeof window !== 'undefined' && 'WebSocket' in window
  useEffect(() => {
    setSseEnabled(!supportsWs)
  }, [supportsWs])

  useNotificationsSocketIO((status) => {
    if (status === 'open') {
      // WS healthy, disable SSE and reset failure counter
      setSseEnabled(false)
      failureCountRef.current = 0
      if (failureResetTimerRef.current) window.clearTimeout(failureResetTimerRef.current)
      failureResetTimerRef.current = null
    }
    if (status === 'error' || status === 'closed') {
      // Count consecutive WS failures; only enable SSE after threshold to avoid flapping
      failureCountRef.current += 1
      if (!failureResetTimerRef.current) {
        failureResetTimerRef.current = window.setTimeout(() => {
          failureCountRef.current = 0
          failureResetTimerRef.current = null
        }, 30000) // reset failures after 30s
      }
      if (failureCountRef.current >= 3) {
        setSseEnabled(true)
      }
    }
  })
  useNotificationsStream(sseEnabled, true)

  useEffect(() => {
    // The hook reads token from localStorage; ensure it's present when backendToken changes
    if (typeof window !== 'undefined' && backendToken) {
      localStorage.setItem('auth_token', backendToken)
    }
  }, [backendToken])

  return <>{children}</>
}