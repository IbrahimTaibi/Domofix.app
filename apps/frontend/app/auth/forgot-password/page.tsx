import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/profile')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  )
}