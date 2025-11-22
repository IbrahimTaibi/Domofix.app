"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/components/providers/auth-provider'

interface ProviderGuardProps {
  children: React.ReactNode
}

/**
 * ProviderGuard - Protects routes that should only be accessible to providers
 * Redirects non-providers to appropriate pages based on their role/status
 */
export default function ProviderGuard({ children }: ProviderGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  // Track mounting to prevent premature redirects
  useEffect(() => {
    // Give auth system time to initialize (prevent race condition)
    const timer = setTimeout(() => {
      setHasMounted(true)
    }, 300) // Increased from 100ms to 300ms
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('[ProviderGuard] Auth state:', {
      isLoading,
      isAuthenticated,
      user: user ? { id: user.id, role: user.role, providerStatus: user.providerStatus } : null,
      hasMounted
    })

    // Don't check auth until component has mounted
    if (!hasMounted) {
      console.log('[ProviderGuard] Not mounted yet, waiting...')
      return
    }

    // Wait for auth to finish loading
    if (isLoading) {
      console.log('[ProviderGuard] Still loading, waiting...')
      setIsChecking(true)
      return
    }

    console.log('[ProviderGuard] Auth loaded, checking authorization...')
    console.log('[ProviderGuard] User details:', user)
    // Auth has finished loading, now check authorization
    setIsChecking(false)

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      console.log('[ProviderGuard] Not authenticated, redirecting to auth')
      router.push('/auth?redirect=/dashboard/provider')
      return
    }

    console.log('[ProviderGuard] User authenticated, role:', user.role)

    // Check if user is a provider
    if (user.role !== 'provider') {
      console.log('[ProviderGuard] User is not a provider, redirecting...')
      // If they're a customer, redirect to customer dashboard or home
      if (user.role === 'customer') {
        router.push('/dashboard/customer')
      } else if (user.role === 'admin') {
        // Admins might have a different dashboard
        router.push('/admin')
      } else {
        // Unknown role - redirect to profile
        router.push('/profile')
      }
      return
    }

    console.log('[ProviderGuard] User is authorized as provider!')

    // If providerStatus is not approved, might want to show a message
    // Uncomment this if you want to restrict based on provider approval status
    // if (user.providerStatus !== 'approved') {
    //   router.push('/provider-application-pending')
    // }
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

  // Auth check complete - verify user is authenticated and is a provider
  const isAuthorized = isAuthenticated && user && user.role === 'provider'

  // Not authenticated or not a provider - show loading while redirecting
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

  // User is authenticated and is a provider - render children
  return <>{children}</>
}
