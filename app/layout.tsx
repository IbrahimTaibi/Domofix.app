import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar, Footer } from '@/components/layout'
import { AuthProvider } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tawa - La plateforme des services de votre ville',
  description: 'Connectez-vous avec des professionnels et petites entreprises de confiance près de chez vous — instantanément.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <div className="min-h-screen pt-14 sm:pt-16 md:pt-18">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

