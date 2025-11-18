import { useCallback, useMemo } from 'react'
import type { UpdateUserRequest, User } from '@domofix/shared-types'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { profileService } from '../services/profile-service'

export function useProfile() {
  const { user, isLoading, error, refreshProfile, setUser } = useAuthStore((s) => ({
    user: s.user,
    isLoading: s.isLoading,
    error: s.error,
    refreshProfile: s.refreshProfile,
    setUser: s.setUser,
  }))

  const isAuthenticated = !!user

  const displayName = useMemo(() => {
    if (!user) return ''
    const first = user.firstName || ''
    const last = user.lastName || ''
    return [first, last].filter(Boolean).join(' ').trim()
  }, [user])

  const initials = useMemo(() => {
    if (!user) return ''
    const f = user.firstName?.[0] ?? ''
    const l = user.lastName?.[0] ?? ''
    return `${f}${l}`.toUpperCase()
  }, [user])

  const role = user?.role
  const isCustomer = role === 'customer'
  const isProvider = role === 'provider'
  const isAdmin = role === 'admin'

  const refresh = useCallback(async () => {
    return await refreshProfile()
  }, [refreshProfile])

  const updateLocal = useCallback((patch: Partial<UpdateUserRequest>) => {
    if (!user) return
    // Ensure nested required objects remain fully typed
    const mergedNotificationPrefs = patch.notificationPreferences
      ? { ...user.notificationPreferences, ...patch.notificationPreferences }
      : user.notificationPreferences

    const { notificationPreferences, ...restPatch } = patch

    const merged: User = {
      ...user,
      ...restPatch,
      notificationPreferences: mergedNotificationPrefs,
    }

    setUser(merged)
    return merged
  }, [user, setUser])

  const updateProfile = useCallback(async (patch: UpdateUserRequest) => {
    const updated = await profileService.updateProfile(patch)
    setUser(updated)
    return updated
  }, [setUser])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    displayName,
    initials,
    role,
    isCustomer,
    isProvider,
    isAdmin,
    profileCompleted: !!user?.profileCompleted,
    onboardingCompleted: !!user?.onboardingCompleted,
    providerStatus: user?.providerStatus,
    refresh,
    updateLocal,
    updateProfile,
  }
}