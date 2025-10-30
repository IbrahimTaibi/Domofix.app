import type { Metadata } from 'next'
import { GetStartedProviderSection } from '@/components/get-started/provider-section'

export const metadata: Metadata = {
  title: 'Commencer en tant que prestataire — Tawa',
  description: "Profitez d'un mois gratuit et gérez votre activité depuis un tableau de bord unifié.",
}

export default function GetStartedProviderPage() {
  return (
    <main className="pt-20">
      <GetStartedProviderSection />
    </main>
  )
}


