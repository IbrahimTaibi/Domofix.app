"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Navbar, SecondaryNavbar } from '@/shared/components/layout'

export default function AppChrome() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  if (isDashboard) {
    return null
  }

  return (
    <>
      <Navbar />
      <SecondaryNavbar />
    </>
  )
}