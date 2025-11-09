import { Metadata } from 'next'
import { ContactHero, ContactMethods, ContactForm } from '@/features/contact'

export const metadata: Metadata = {
  title: 'Contactez-nous | Domofix',
  description: 'Besoin d’aide ou d’informations ? Contactez l’équipe Domofix — nous sommes là pour vous aider.',
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <ContactHero />
      <ContactMethods />
      <ContactForm />
    </main>
  )
}