"use client";

import { create } from 'zustand'
import { getSession } from 'next-auth/react'
import type { User, RegisterRequest, LoginRequest, CreateProviderApplicationRequest, ProviderApplication } from '@darigo/shared-types'
import { apiClient } from '@/shared/utils/api'

type AuthState = {
  user: User | null
  backendToken: string | null
  isLoading: boolean
  error: string | null
}

type AuthActions = {
  setUser: (user: User | null) => void
  setBackendToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  applyProvider: (data: CreateProviderApplicationRequest, document: File) => Promise<ProviderApplication>
  refreshProfile: () => Promise<User | null>
  setAuthToken: (token: string) => void
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  backendToken: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  setBackendToken: (token) => {
    if (token) {
      apiClient.setAuthToken(token)
    } else {
      // Clear client-side token when removing from store
      apiClient.logout()
    }
    set({ backendToken: token })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  login: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await apiClient.login(data)
      // Persist token via ApiClient; also mirror in store
      set({ backendToken: response.access_token, user: response.user })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ error: message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  register: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await apiClient.register(data)
      set({ backendToken: response.access_token, user: response.user })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ error: message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  logout: () => {
    try {
      apiClient.logout()
    } finally {
      set({ user: null, backendToken: null, error: null })
    }
  },
  checkAuth: async () => {
    console.log('[AuthStore] checkAuth started')
    // 1) Try syncing NextAuth session-backed token to our backend client
    try {
      const session = await getSession()
      console.log('[AuthStore] Session:', session ? 'exists' : 'null')
      const backendToken = (session as any)?.backendAccessToken as string | undefined
      if (backendToken) {
        console.log('[AuthStore] Backend token found in session')
        apiClient.setAuthToken(backendToken)
        set({ backendToken })
        const instantUser = (session as any)?.backendUser as User | undefined
        if (instantUser) {
          console.log('[AuthStore] Instant user found:', instantUser.id, instantUser.role)
          set({ user: instantUser })
        }
      } else {
        console.log('[AuthStore] No backend token in session')
      }

      // Fallback: if NextAuth session exists but backend token missing, link via email
      const provider = (session as any)?.provider as 'facebook' | 'google' | undefined
      const providerId = (session as any)?.providerId as string | undefined
      const email = session?.user?.email
      const name = session?.user?.name || ''
      if (!backendToken && provider && (email || providerId)) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          const [firstName, ...rest] = name.split(' ')
          const lastName = rest.join(' ') || undefined
          const { httpRequest } = await import('@/shared/utils/http')
          const data = await httpRequest<any>(`${apiBase}/auth/oauth/${provider}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, providerId, email, firstName, lastName, avatar: session?.user?.image }),
          })
            apiClient.setAuthToken(data.access_token)
            set({ backendToken: data.access_token })
        } catch {
          // Ignore and continue; user can still use email/password
        }
      }
    } catch {
      // Ignore session fetch errors
    }

    // 2) If we have a backend token (from localStorage or NextAuth), fetch profile
    if (apiClient.isAuthenticated()) {
      console.log('[AuthStore] API client is authenticated, fetching profile...')
      try {
        const userData = await apiClient.getProfile()
        console.log('[AuthStore] Profile fetched:', userData.id, userData.role)
        set({ user: userData })
      } catch (err) {
        console.error('[AuthStore] Error fetching profile:', err)
        const { trackError } = await import('@/shared/utils/error-tracking')
        trackError(err, { source: 'auth-store.checkAuth.getProfile' })
        apiClient.logout()
        set({ backendToken: null })
      }
    } else {
      console.log('[AuthStore] API client not authenticated')
    }
    console.log('[AuthStore] checkAuth complete, setting isLoading=false')
    set({ isLoading: false })
  },
  applyProvider: async (data, document) => {
    try {
      set({ isLoading: true, error: null })
      const application = await apiClient.applyProviderWithDocument(data, document)
      // Refresh user profile to reflect providerStatus changes
      try {
        const userData = await apiClient.getProfile()
        set({ user: userData })
      } catch {
        // ignore profile refresh errors
      }
      return application
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de l'application prestataire"
      set({ error: message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  refreshProfile: async () => {
    try {
      const userData = await apiClient.getProfile()
      set({ user: userData })
      return userData
    } catch {
      return null
    }
  },
  setAuthToken: (token: string) => {
    apiClient.setAuthToken(token)
    set({ backendToken: token })
  },
}))

