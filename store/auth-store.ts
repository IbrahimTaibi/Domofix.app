import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

// Track if auth check is in progress to prevent multiple simultaneous calls
let authCheckInProgress = false

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false, 
    isInitialized: true 
  }),
  
  login: (user) => set({ 
    user, 
    isAuthenticated: true, 
    isLoading: false, 
    isInitialized: true 
  }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: false, 
    isInitialized: true 
  }),

  checkAuth: async () => {
    const state = get()
    
    // Don't check if check is already in progress
    if (authCheckInProgress) {
      return
    }

    authCheckInProgress = true
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          set({ 
            user: result.data, 
            isAuthenticated: true, 
            isLoading: false, 
            isInitialized: true 
          })
          return
        }
      }
      
      // No valid session found - user is not logged in
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        isInitialized: true 
      })
    } catch (error) {
      console.error('Auth check error:', error)
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        isInitialized: true 
      })
    } finally {
      authCheckInProgress = false
    }
  }
}))

