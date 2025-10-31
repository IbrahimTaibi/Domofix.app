import type { Metadata } from 'next'
import LoginForm from '@/components/auth/login-form'
import MockUsersInfo from '@/components/auth/mock-users-info'

export const metadata: Metadata = {
  title: 'Connexion — Tawa',
  description: 'Connectez-vous à votre compte Tawa pour accéder à votre espace personnel.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white page-content pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div>
            <LoginForm />
          </div>
          
          {/* Mock Users Info */}
          <div className="lg:mt-16">
            <MockUsersInfo />
          </div>
        </div>
      </div>
    </main>
  )
}