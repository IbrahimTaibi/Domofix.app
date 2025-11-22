"use client"

import React, { useEffect } from 'react'
import { useNotificationsSocket } from '../hooks/use-notifications-socket'
import { useNotifications } from '../hooks/use-notifications'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { requestNotificationPermission } from '../utils/browser-notifications'

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  // This ensures socket connection is established globally
  useNotificationsSocket()

  // Load initial notifications when user logs in
  const { loadNotifications } = useNotifications()

  useEffect(() => {
    if (user?.id) {
      console.log('[Notifications] User logged in, loading notifications...')
      loadNotifications()
      // Request browser notification permission after a short delay
      setTimeout(() => {
        requestNotificationPermission().then((permission) => {
          console.log('[Notifications] Permission status:', permission)
        })
      }, 2000)
    }
  }, [user?.id])

  return <>{children}</>
}
