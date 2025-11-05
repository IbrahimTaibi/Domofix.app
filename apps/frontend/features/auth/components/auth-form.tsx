'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Button from '@/shared/components/button'
import Input from '@/shared/components/input'
import { Mail, Lock } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { RegisterRequest, LoginRequest } from '@darigo/shared-types'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/features/auth/validation/schemas'
import { signIn, getCsrfToken } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

// Validation schemas moved to '@/features/auth/validation/schemas'

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [direction, setDirection] = useState<1 | -1>(1)
  const { login, register, isLoading, error } = useAuth()
  const router = useRouter()

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: 24 * dir }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: -24 * dir }),
  }

  const openFacebookPopup = async (e?: React.MouseEvent) => {
    try {
      // Prevent any parent form submission or navigation
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const callbackUrl = `${origin}/auth/popup-close`

      const w = 480
      const h = 700
      const y = Math.max(0, (window.screen.height - h) / 2)
      const x = Math.max(0, (window.screen.width - w) / 2)

      // Open a blank popup synchronously to avoid blockers, then set its location
      const popup = window.open(
        'about:blank',
        'facebook_oauth_popup',
        `width=${w},height=${h},top=${y},left=${x},status=0,toolbar=0,menubar=0,location=0,resizable=1,scrollbars=1`
      )

      if (!popup) {
        // Fallback: popup was blocked -> full redirect
        await signIn('facebook', { callbackUrl })
        return
      }

      // Submit a POST inside the popup to skip intermediate pages
      const csrfToken = await getCsrfToken()
      if (!csrfToken) {
        // Fallback: if CSRF cannot be fetched, use provider endpoint directly in popup
        popup.location.href = `${origin}/api/auth/signin/facebook?callbackUrl=${encodeURIComponent(callbackUrl)}`
      } else {
        const doc = popup.document
        doc.open()
        doc.write(`<!doctype html><html><head><title>Facebook Auth</title></head><body>
          <form id="nextauth" method="post" action="${origin}/api/auth/signin/facebook">
            <input type="hidden" name="csrfToken" value="${csrfToken}" />
            <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
          </form>
          <script>document.getElementById('nextauth').submit();</script>
        </body></html>`)
        doc.close()
      }

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== origin) return
        if (event.data && event.data.type === 'nextauth:signin' && event.data.status === 'success') {
          try { popup.close() } catch {}
          router.refresh()
          // Navigate to home after successful OAuth popup flow
          router.push('/')
        }
      }
      window.addEventListener('message', onMessage)
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer)
          window.removeEventListener('message', onMessage)
        }
      }, 500)
    } catch (err) {
      console.error('Facebook popup sign-in failed', err)
    }
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'customer',
      phoneNumber: '',
      countryCode: '',
    },
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    const loginData: LoginRequest = {
      email: data.email,
      password: data.password,
    }
    try {
      await login(loginData, '/profile')
      // Force a refresh of the UI to update components that depend on auth state
      router.refresh()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    const registerData: RegisterRequest = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      ...(data.countryCode && { countryCode: data.countryCode }),
    }
    try {
      await register(registerData, '/profile')
      // Force a refresh of the UI to update components that depend on auth state
      router.refresh()
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const toggleMode = () => {
    setDirection(mode === 'login' ? 1 : -1)
    setMode(mode === 'login' ? 'register' : 'login')
    loginForm.reset()
    registerForm.reset()
  }

  // Registration is limited to customer accounts; provider registration is separate.
  // Ensure role stays 'customer'.
  registerForm.setValue('role', 'customer')

  return (
    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 sm:p-8 max-w-md w-full mx-auto">
      {/* Mode Toggle */}
      <div className="mb-6">
        <div className="inline-flex w-full rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setDirection(-1); setMode('login') }}
            className={`flex-1 py-2 px-3 sm:px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={mode === 'login'}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setDirection(1); setMode('register') }}
            className={`flex-1 py-2 px-3 sm:px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={mode === 'register'}
          >
            Inscription
          </button>
        </div>
      </div>

      {/* Social Auth: Facebook */}
      <div className="mb-6 space-y-3">
        <div className="relative flex items-center">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-xs text-gray-500">Ou continuer avec</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <Button
          type="button"
          aria-label="Continuer avec Facebook"
          variant="ghost"
          className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5] focus:ring-[#1877F2]"
          onClick={openFacebookPopup}
        >
          <FaFacebookF className="h-5 w-5 mr-2" aria-hidden="true" />
          Continuer avec Facebook
        </Button>

        <Button
          type="button"
          aria-label="Continuer avec Google"
          variant="outline"
          className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-[#4285F4]"
          onClick={() => signIn('google', { callbackUrl: '/profile' })}
        >
          <FcGoogle className="h-5 w-5 mr-2" aria-hidden="true" />
          Continuer avec Google
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {mode === 'login' ? (
          <motion.form
            key="login"
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="exemple@email.com"
              icon={Mail}
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />

            <Input
              id="login-password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="register"
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            className="space-y-4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <Input
                  id="register-firstName"
                  type="text"
                  placeholder="Jean"
                  {...registerForm.register('firstName')}
                  className={registerForm.formState.errors.firstName ? 'border-red-300' : ''}
                />
                {registerForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <Input
                  id="register-lastName"
                  type="text"
                  placeholder="Dupont"
                  {...registerForm.register('lastName')}
                  className={registerForm.formState.errors.lastName ? 'border-red-300' : ''}
                />
                {registerForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="register-email"
                type="email"
                placeholder="exemple@email.com"
                {...registerForm.register('email')}
                className={registerForm.formState.errors.email ? 'border-red-300' : ''}
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Provider-only fields removed from registration form */}

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                {...registerForm.register('password')}
                className={registerForm.formState.errors.password ? 'border-red-300' : ''}
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 6 caractères, avec au moins une minuscule, une majuscule et un chiffre
              </p>
            </div>

            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <Input
                id="register-confirmPassword"
                type="password"
                placeholder="••••••••"
                {...registerForm.register('confirmPassword')}
                className={registerForm.formState.errors.confirmPassword ? 'border-red-300' : ''}
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      </div>

      {/* Toggle Link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => { toggleMode() }}
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          {mode === 'login' 
            ? "Pas encore de compte ? S'inscrire" 
            : "Déjà un compte ? Se connecter"
          }
        </button>
      </div>
    </div>
  )
}