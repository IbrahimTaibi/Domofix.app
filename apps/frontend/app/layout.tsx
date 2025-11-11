import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar, Footer, SecondaryNavbar } from '@/shared/components/layout'
import AppChrome from '@/shared/components/layout/app-chrome'
import RootMain from '@/shared/components/layout/root-main'
import AppFooter from '@/shared/components/layout/app-footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from '@/app/providers'
import OfflineBanner from '@/shared/components/error/offline-banner'
import ToastContainer from '@/shared/components/toast-container'

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
          {/* Site chrome (navbar, secondary navbar, footer) hidden on /dashboard */}
          <AppChrome />
          {/* Main content area with conditional padding based on route */}
          <RootMain>
            {children}
          </RootMain>
          {/* Footer for site routes (hidden on /dashboard) */}
          <AppFooter />
          {/* Global toasts */}
          <ToastContainer />
          {/* Portal target for toasts to avoid hydration mismatch */}
          <div id="toast-root" />
          <OfflineBanner />
        </Providers>
      </body>
    </html>
  )
}

