import { create } from 'zustand'
import { User } from '@darigo/shared-types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ 
      user, 
      isAuthenticated: !!user, 
      isLoading: false, 
      isInitialized: true 
    })
  },
  
  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ 
      user, 
      isAuthenticated: true, 
      isLoading: false, 
      isInitialized: true 
    })
  },
  
  logout: () => {
    localStorage.removeItem('user')
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false, 
      isInitialized: true 
    })
  },

  checkAuth: () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false, 
          isInitialized: true 
        })
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          isInitialized: true 
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('user')
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        isInitialized: true 
      })
    }
  }
}))

