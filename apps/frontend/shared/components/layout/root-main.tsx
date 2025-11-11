"use client"

import React from 'react'
import { usePathname } from 'next/navigation'

export default function RootMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  const className = isDashboard
    ? 'min-h-screen'
    : 'min-h-screen pt-[calc(var(--navbar-height,4rem))] md:pt-[calc(var(--navbar-height,4rem)+var(--secondary-navbar-height,0px))] pb-[calc(var(--secondary-navbar-mobile-height,0px)+1rem)] md:pb-0'

  return <main className={className}>{children}</main>
}