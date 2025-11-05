"use client";

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GetStartedHero } from '@/features/get-started/components/hero'
import HowItWorksSection from '@/shared/components/sections/how-it-works'
import { GetStartedCTA } from '@/features/get-started/components/cta-panel'
import { useAuth } from '@/features/auth/hooks/useAuth'

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


