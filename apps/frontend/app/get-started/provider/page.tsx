import type { Metadata } from 'next'
import { GetStartedProviderSection } from '@/features/get-started/components/provider-section'

export const metadata: Metadata = {
  title: 'Commencer en tant que prestataire — Domofix',
  description: "Profitez d'un mois gratuit et gérez votre activité depuis un tableau de bord unifié.",
}

export default function GetStartedProviderPage() {
  return (
    <main className="page-content">
      <GetStartedProviderSection />
    </main>
  )
}


