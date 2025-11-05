"use client";

import { create } from 'zustand'
import type { User } from '@darigo/shared-types'

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
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  backendToken: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  setBackendToken: (token) => set({ backendToken: token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

