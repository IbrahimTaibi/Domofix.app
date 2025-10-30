import type { Metadata } from 'next'
import LoginForm from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Connexion — Tawa',
  description: 'Connectez-vous à votre compte Tawa pour accéder à votre espace personnel.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </main>
  )
}