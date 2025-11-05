import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar, Footer, SecondaryNavbar } from '@/shared/components/layout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Providers from '@/app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Domofix - La plateforme des services de votre ville',
  description: 'Connectez-vous avec des professionnels et petites entreprises de confiance près de chez vous — instantanément.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const initialUser = (session as any)?.backendUser ?? null
  const initialBackendToken = (session as any)?.backendAccessToken ?? null

  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers session={session} initialUser={initialUser} initialBackendToken={initialBackendToken}>
          <Navbar />
          {/* Secondary navigation bar under the main one (desktop only) */}
          <SecondaryNavbar />
          {/* Adjust main padding to account for fixed navbars (top + mobile bottom). Fallbacks are 0 so spacing applies only when the secondary navbar is present. */}
          <main className="min-h-screen pt-[calc(var(--navbar-height,4rem))] md:pt-[calc(var(--navbar-height,4rem)+var(--secondary-navbar-height,0px))] pb-[calc(var(--secondary-navbar-mobile-height,0px)+1rem)] md:pb-0">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

