"use client"

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/features/auth/components/providers'
import { NotificationsProvider } from '@/features/notifications/components/providers/notifications-provider'

interface ProvidersProps {
  session: any
  initialUser?: any
  initialBackendToken?: string | null
  children: React.ReactNode
}

export default function Providers({ session, initialUser = null, initialBackendToken = null, children }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider initialUser={initialUser} initialBackendToken={initialBackendToken}>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </AuthProvider>
    </SessionProvider>
  )
}