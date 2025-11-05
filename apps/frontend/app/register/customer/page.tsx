import type { Metadata } from 'next'
import { CustomerRegistrationForm } from '@/features/auth/components/customer-registration-form'

export const metadata: Metadata = {
  title: 'Inscription client — Domofix',
  description: 'Créez votre compte client et accédez à des milliers de prestataires près de chez vous.',
}

export default function CustomerRegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <CustomerRegistrationForm />
    </main>
  )
}
