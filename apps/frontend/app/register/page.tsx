import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Inscription — Domofix',
  description: 'Créez votre compte sur Domofix et rejoignez notre communauté.',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-4xl page-content pb-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Rejoignez Domofix
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choisissez le type de compte que vous souhaitez créer
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Je suis un client</h2>
          <p className="text-gray-600 mb-6">
            Créez un compte client pour trouver des prestataires de services près de chez vous.
          </p>
          <Link 
            href="/register/customer" 
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
          >
            S'inscrire comme client
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Je suis un prestataire</h2>
          <p className="text-gray-600 mb-6">
            Créez un compte prestataire pour proposer vos services et développer votre activité.
          </p>
          <Link 
            href="/register/provider" 
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
          >
            S'inscrire comme prestataire
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}