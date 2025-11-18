"use client"

import { useEffect, useRef } from 'react'
import { useNotificationsStore } from '@/shared/store/notifications-store'
import type { Notification } from '@domofix/shared-types'
import { playNotificationAudioFile } from '@/shared/utils/sound'
import { io, Socket } from 'socket.io-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

type Status = 'connecting' | 'open' | 'error' | 'closed'

export function useNotificationsSocketIO(onStatusChange?: (s: Status) => void) {
  const add = useNotificationsStore((s) => s.add)
  const socketRef = useRef<Socket | null>(null)
  const statusRef = useRef<((s: Status) => void) | null>(onStatusChange ?? null)

  // Keep a stable ref to the status callback to avoid re-initializing the socket on re-renders
  useEffect(() => {
    statusRef.current = onStatusChange ?? null
  }, [onStatusChange])

  // Connect once on mount; avoid reconnect loops on component re-renders
  useEffect(() => {
    const token = getToken()
    if (!token) return
    try {
      statusRef.current?.('connecting')
      const socket = io(`${API_BASE_URL}/notifications`, {
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
      })
      socketRef.current = socket

      socket.on('connect', () => statusRef.current?.('open'))
      socket.on('connect_error', () => statusRef.current?.('error'))
      socket.on('disconnect', () => statusRef.current?.('closed'))

      socket.on('notification', (payload: { event: string; data: Notification }) => {
        try {
          playNotificationAudioFile()
          add(payload.data)
        } catch {}
      })

      // Optional: consume status events from server
      socket.on('status', (msg: any) => {
        const s = String(msg?.status || '') as Status
        if (s) statusRef.current?.(s)
      })
    } catch {
      statusRef.current?.('error')
    }

    return () => {
      try { socketRef.current?.disconnect() } catch {}
      socketRef.current = null
    }
  }, [])
}