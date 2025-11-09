"use client"

import { useEffect, useRef } from 'react'
import { useNotificationsStore } from '@/shared/store/notifications-store'
import type { Notification } from '@darigo/shared-types'
import { playNotificationAudioFile } from '@/shared/utils/sound'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function toWsUrl(base: string): string {
  try {
    const u = new URL(base)
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
    u.pathname = '/notifications/ws'
    return u.toString()
  } catch {
    // Fallback
    return base.replace(/^http/, 'ws') + '/notifications/ws'
  }
}

type Status = 'connecting' | 'open' | 'error' | 'closed'

export function useNotificationsWebSocket(onStatusChange?: (s: Status) => void) {
  const add = useNotificationsStore((s) => s.add)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<number | null>(null)
  const supportsWs = typeof window !== 'undefined' && 'WebSocket' in window

  useEffect(() => {
    if (!supportsWs) return
    const token = getToken()
    if (!token) return

    const connect = () => {
      try {
        onStatusChange?.('connecting')
        const base = API_BASE_URL
        const wsUrl = toWsUrl(base)
        const urlWithToken = `${wsUrl}?token=${encodeURIComponent(token)}`
        const ws = new WebSocket(urlWithToken)
        wsRef.current = ws

        ws.onopen = () => {
          // Connected; clear any reconnection backoff
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
          onStatusChange?.('open')
        }

        ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data)
            if (payload?.event === 'notification') {
              const data = payload.data as Notification
              // Play sound immediately (audio file or chime), then update store
              playNotificationAudioFile()
              add(data)
            }
          } catch {}
        }

        ws.onerror = () => {
          // Try to reconnect after a short delay
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
          reconnectTimer.current = window.setTimeout(() => {
            try { wsRef.current?.close() } catch {}
            connect()
          }, 3000)
          onStatusChange?.('error')
        }

        ws.onclose = () => {
          // Attempt reconnect unless explicitly closed
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
          reconnectTimer.current = window.setTimeout(() => connect(), 3000)
          onStatusChange?.('closed')
        }
      } catch {
        // noop; fallback handled by provider by also mounting SSE if desired
      }
    }

    connect()

    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      if (wsRef.current) { try { wsRef.current.close() } catch {} }
      wsRef.current = null
    }
  }, [add, supportsWs])
}