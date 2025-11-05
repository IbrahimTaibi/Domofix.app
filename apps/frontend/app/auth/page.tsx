import type { Metadata } from 'next'
import { AuthForm } from '@/features/auth/components/auth-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Connexion / Inscription — Darigo',
  description: 'Connectez-vous à votre compte ou créez un nouveau compte sur Darigo.',
}

export default async function AuthPage() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user || !!(session as any)?.backendAccessToken
  if (isLoggedIn) {
    redirect('/profile')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bienvenue sur Darigo
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            Connectez-vous ou créez votre compte pour accéder à nos services
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}