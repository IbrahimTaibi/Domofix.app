"use client";

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GetStartedHero } from '@/components/get-started/hero'
import HowItWorksSection from '@/components/sections/how-it-works'
import { GetStartedCTA } from '@/components/get-started/cta-panel'
import { useAuth } from '@/hooks/useAuth'

export default function CustomerGetStartedPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="page-content">
      <GetStartedHero isAuthenticated={isAuthenticated} user={user} />
      <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading steps…</div>}>
        <HowItWorksSection />
      </Suspense>
      <GetStartedCTA />
    </main>
  );
}


