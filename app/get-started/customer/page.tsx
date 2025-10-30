import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GetStartedHero } from '@/components/get-started/hero'
import HowItWorksSection from '@/components/sections/how-it-works'
import { GetStartedCTA } from '@/components/get-started/cta-panel'

export const metadata: Metadata = {
  title: 'Commencer en tant que client — Tawa',
  description: 'Comparez les prestataires, voyez des prix transparents et réservez en quelques minutes.',
}

export default function GetStartedCustomerPage() {
  return (
    <main className="pt-20">
      <GetStartedHero />
      <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading steps…</div>}>
        <HowItWorksSection />
      </Suspense>
      <GetStartedCTA />
    </main>
  )
}


