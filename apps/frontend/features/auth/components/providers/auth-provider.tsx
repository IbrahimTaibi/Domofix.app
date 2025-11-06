"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { User, RegisterRequest, LoginRequest, CreateProviderApplicationRequest, ProviderApplication } from '@darigo/shared-types';
import { apiClient } from '@/shared/utils/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest, redirectTo?: string) => Promise<void>;
  logout: (redirectTo?: string) => void;
  register: (data: RegisterRequest, redirectTo?: string) => Promise<void>;
  applyProvider: (data: CreateProviderApplicationRequest, document: File) => Promise<ProviderApplication>;
  error: string | null;
}

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser = null, initialBackendToken = null }: { children: React.ReactNode; initialUser?: User | null; initialBackendToken?: string | null }) {
  const router = useRouter();
  const { data: sessionData, status } = useSession();
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setError = useAuthStore((s) => s.setError)
  const setBackendToken = useAuthStore((s) => s.setBackendToken)
  const storeLogin = useAuthStore((s) => s.login)
  const storeRegister = useAuthStore((s) => s.register)
  const storeLogout = useAuthStore((s) => s.logout)
  const storeApplyProvider = useAuthStore((s) => s.applyProvider)
  const storeCheckAuth = useAuthStore((s) => s.checkAuth)

  // Seed backend token immediately if provided from SSR session
  useEffect(() => {
    if (initialBackendToken) {
      apiClient.setAuthToken(initialBackendToken as string);
      setBackendToken(initialBackendToken)
    }
    if (initialUser) {
      setUser(initialUser)
    }
  }, [initialBackendToken, initialUser, setBackendToken, setUser]);

  useEffect(() => {
    // Unified check via store
    storeCheckAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to NextAuth session changes (e.g., after OAuth in a popup)
  useEffect(() => {
    const syncFromSession = async () => {
      if (status === 'authenticated') {
        const backendToken = (sessionData as any)?.backendAccessToken;
        if (backendToken) {
          apiClient.setAuthToken(backendToken);
          setBackendToken(backendToken)
          const instantUser = (sessionData as any)?.backendUser;
          if (instantUser) {
            setUser(instantUser as User);
          }
        }

        // Fallback linking if token missing but provider/email exist
        const provider = (sessionData as any)?.provider as 'facebook' | 'google' | undefined;
        const providerId = (sessionData as any)?.providerId as string | undefined;
        const email = sessionData?.user?.email;
        const name = sessionData?.user?.name || '';
        if (!backendToken && provider && (email || providerId)) {
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const [firstName, ...rest] = name.split(' ');
            const lastName = rest.join(' ') || undefined;
            const res = await fetch(`${apiBase}/auth/oauth/${provider}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider, providerId, email, firstName, lastName, avatar: sessionData?.user?.image }),
            });
            if (res.ok) {
              const data = await res.json();
              apiClient.setAuthToken(data.access_token);
            }
          } catch (e) {
            // Ignore and continue; user can still use email/password
          }
        }

        // Fetch profile with the latest backend token
        if (apiClient.isAuthenticated()) {
          try {
            const userData = await apiClient.getProfile();
            setUser(userData);
          } catch (err) {
            apiClient.logout();
            setBackendToken(null)
          }
        }
        setLoading(false);
      } else if (status === 'unauthenticated') {
        // No session; stop loading and clear user
        setLoading(false);
      }
    };
    syncFromSession();
  }, [status, sessionData]);

  const login = async (data: LoginRequest, redirectTo = '/profile') => {
    try {
      setError(null)
      await storeLogin(data)
      router.refresh()
      if (redirectTo) router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const logout = (redirectTo = '/auth') => {
    storeLogout()
    setError(null)
    try { signOut({ redirect: true, callbackUrl: redirectTo }); } catch {}
  };

  const register = async (data: RegisterRequest, redirectTo = '/profile') => {
    try {
      setError(null)
      await storeRegister(data)
      router.refresh()
      if (redirectTo) router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    }
  };

  const applyProvider = async (data: CreateProviderApplicationRequest, document: File) => {
    try {
      setError(null)
      const application = await storeApplyProvider(data, document)
      router.refresh()
      return application
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'application prestataire")
      throw err
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    applyProvider,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}