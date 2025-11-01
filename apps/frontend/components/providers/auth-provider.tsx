'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/store'

interface AuthProviderProps {
  children: React.ReactNode
}

interface AuthContextType {
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType>({ isInitializing: true })

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    const initializeAuth = () => {
      try {
        checkAuth()
      } catch (error) {
        console.error('AuthProvider: Auth initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [checkAuth])

  // Show loading state while initializing authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}