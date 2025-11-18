"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/components/providers/auth-provider'

interface CustomerGuardProps {
  children: React.ReactNode
}

/**
 * CustomerGuard - Protects routes that should only be accessible to customers
 * Redirects non-customers to appropriate pages based on their role/status
 */
export default function CustomerGuard({ children }: CustomerGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  // Track mounting to prevent premature redirects
  useEffect(() => {
    // Give auth system time to initialize (prevent race condition)
    const timer = setTimeout(() => {
      setHasMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Don't check auth until component has mounted
    if (!hasMounted) {
      return
    }

    // Wait for auth to finish loading
    if (isLoading) {
      setIsChecking(true)
      return
    }

    // Auth has finished loading, now check authorization
    setIsChecking(false)

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      router.push('/auth?redirect=/dashboard/customer')
      return
    }

    // Check if user is a customer
    if (user.role !== 'customer') {
      // If they're a provider, redirect to provider dashboard
      if (user.role === 'provider') {
        router.push('/dashboard/provider')
      } else if (user.role === 'admin') {
        router.push('/admin')
      } else {
        // Unknown role - redirect to profile
        router.push('/profile')
      }
    }
  }, [user, isLoading, isAuthenticated, router, hasMounted])

  // Show loading state while checking authentication or during initial mount
  if (!hasMounted || isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Auth check complete - verify user is authenticated and is a customer
  const isAuthorized = isAuthenticated && user && user.role === 'customer'

  // Not authenticated or not a customer - show loading while redirecting
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  // User is authenticated and is a customer - render children
  return <>{children}</>
}
