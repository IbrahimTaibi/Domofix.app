'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { useMobile } from '@/hooks'

export default function Footer() {
  const isMobile = useMobile();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-white">Tawa</span>
            </div>
            <p className="text-sm text-gray-400">
              Nous vous connectons avec des professionnels et des entreprises locales de confiance, près de chez vous.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary-400 transition">Plomberie</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Ménage</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Livraison</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Cours particuliers</Link></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pour les prestataires</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary-400 transition">Devenir prestataire</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Tableau de bord</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Tarifs</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Assistance</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary-400 transition">À propos</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Carrières</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className={`border-t border-gray-800 mt-8 pt-8 flex justify-between items-center ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <p className="text-sm text-gray-400">
            © 2024 Tawa. Tous droits réservés.
          </p>
          <div className={`flex space-x-6 ${isMobile ? 'mt-4' : 'mt-0'}`}>
            <Link href="#" className="hover:text-primary-400 transition">Conditions</Link>
            <Link href="#" className="hover:text-primary-400 transition">Confidentialité</Link>
            <Link href="#" className="hover:text-primary-400 transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

