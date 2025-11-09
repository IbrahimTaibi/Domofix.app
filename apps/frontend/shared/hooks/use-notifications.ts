"use client"

import { useEffect, useRef } from 'react'
import { useNotificationsStore } from '@/shared/store/notifications-store'
import { playNotificationChime } from '@/shared/utils/sound'
import type { Notification } from '@darigo/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function useNotificationsStream(enabled: boolean = true, playSound: boolean = true) {
  const add = useNotificationsStore((s) => s.add)
  const esRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const token = getToken()
    if (!token) return

    const connect = () => {
      try {
        const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
        const es = new EventSource(url, { withCredentials: false })
        esRef.current = es

        es.addEventListener('notification', (evt: MessageEvent) => {
          try {
            const data = JSON.parse(evt.data) as Notification
            if (playSound) {
              try {
                // When SSE is the active transport, play the sound immediately
                const { playNotificationAudioFile } = require('@/shared/utils/sound')
                playNotificationAudioFile()
              } catch {}
            }
            add(data)
          } catch {}
        })

        es.addEventListener('heartbeat', () => {})

        es.onerror = () => {
          // Backoff reconnect (10s) to avoid spamming server
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
          reconnectTimer.current = window.setTimeout(() => {
            if (esRef.current) { try { esRef.current.close() } catch {} }
            connect()
          }, 10000)
        }
      } catch {
        // no-op
      }
    }

    connect()

    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      if (esRef.current) { try { esRef.current.close() } catch {} }
      esRef.current = null
    }
  }, [add, enabled, playSound])
}