"use client"

import React from 'react'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'

export default function OfflineBanner() {
  const { online } = useNetworkStatus()
  if (online) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-100 border-t border-yellow-200 text-yellow-900 text-sm p-2 text-center">
      Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.
    </div>
  )
}