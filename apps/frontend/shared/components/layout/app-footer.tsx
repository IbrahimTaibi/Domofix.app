"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Footer } from '@/shared/components/layout'

export default function AppFooter() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  if (isDashboard) return null
  return <Footer />
}