import { useAuthStore } from '@/store'
import { User } from '@/types'

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore()

  const loginUser = (userData: User) => {
    // No need to store in localStorage anymore - using HTTP-only cookies
    login(userData)
  }

  const logoutUser = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/me', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear client-side state
      logout()
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginUser,
    logout: logoutUser,
  }
}