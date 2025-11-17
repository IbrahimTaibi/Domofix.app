"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function useAuthTokenReady(timeoutMs = 4000) {
  const { backendToken, checkAuth, isLoading } = useAuthStore()
  const [expired, setExpired] = useState(false)
  const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  useEffect(() => {
    checkAuth().catch(() => {})
    const t = setTimeout(() => setExpired(true), timeoutMs)
    return () => clearTimeout(t)
  }, [checkAuth, timeoutMs])

  const ready = useMemo(() => (!!backendToken || !!localToken) && !isLoading, [backendToken, localToken, isLoading])
  return { token: backendToken || localToken, ready, expired }
}