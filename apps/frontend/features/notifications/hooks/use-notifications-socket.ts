"use client"

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useNotificationsStore } from '../store/notifications-store'
import { useAuthStore } from '@/features/auth/store/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function useNotificationsSocket() {
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const user = useAuthStore((s) => s.user)
  const backendToken = useAuthStore((s) => s.backendToken)
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead)
  const removeNotification = useNotificationsStore((s) => s.removeNotification)

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user?.id || !backendToken) {
      if (socketRef.current) {
        console.log('[Notifications] Disconnecting socket - no auth')
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('[Notifications] Socket already connected')
      return
    }

    // Create socket connection to notifications namespace
    console.log('[Notifications] Creating socket connection...')
    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token: backendToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketRef.current = socket

    // Connection status
    socket.on('connect', () => {
      console.log('[Notifications] ✅ Socket connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Notifications] ❌ Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[Notifications] ⚠️ Connection error:', error.message)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Notifications] 🔄 Reconnected after', attemptNumber, 'attempts')
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Notifications] 🔄 Reconnect attempt', attemptNumber)
    })

    socket.on('reconnect_error', (error) => {
      console.error('[Notifications] ⚠️ Reconnection error:', error.message)
    })

    socket.on('reconnect_failed', () => {
      console.error('[Notifications] ❌ Reconnection failed')
    })

    socket.on('status', (data: any) => {
      console.log('[Notifications] 📡 Status:', data)
    })

    // Listen for new notifications
    socket.on('notification', (payload: any) => {
      console.log('[Notifications] 🔔 New notification received:', payload)
      if (payload?.data) {
        addNotification(payload.data)

        // Show browser notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(payload.data.title || 'Nouvelle notification', {
            body: payload.data.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: payload.data.id || 'notification',
            requireInteraction: false,
          })

          // Auto-close after 5 seconds
          setTimeout(() => notification.close(), 5000)

          // Play notification sound
          try {
            const audio = new Audio('/notification-sound.mp3')
            audio.volume = 0.3
            audio.play().catch((e) => console.log('[Notifications] Could not play sound:', e))
          } catch (e) {
            console.log('[Notifications] Sound not available')
          }
        }
      }
    })

    // Listen for read events
    socket.on('notification.read', (payload: any) => {
      console.log('[Notifications] Notification read:', payload)
      if (payload?.id) {
        markAsRead(payload.id)
      }
    })

    // Listen for mark all as read events
    socket.on('notifications.read_all', () => {
      console.log('[Notifications] All notifications marked as read')
      markAllAsRead()
    })

    // Listen for deletion events
    socket.on('notification.deleted', (payload: any) => {
      console.log('[Notifications] Notification deleted:', payload)
      if (payload?.id) {
        removeNotification(payload.id)
      }
    })

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[Notifications] Cleaning up socket connection')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [user?.id, backendToken])

  return socketRef.current
}
