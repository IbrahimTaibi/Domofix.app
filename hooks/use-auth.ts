import { useAuthStore } from '@/store'
import { User } from '@/types'
import { useEffect } from 'react'

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setUser } = useAuthStore()

  // This could be expanded to check for stored tokens in localStorage
  // and attempt to restore the session on page load
  useEffect(() => {
    // Example: Check for stored auth data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User
        setUser(userData)
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('user')
        setUser(null)
      }
    } else {
      // No stored user, mark as not loading
      setUser(null)
    }
  }, [setUser])

  const loginUser = (userData: User) => {
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
    login(userData)
  }

  const logoutUser = () => {
    // Clear stored data
    localStorage.removeItem('user')
    logout()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginUser,
    logout: logoutUser
  }
}