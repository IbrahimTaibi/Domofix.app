"use client"

import RequestServiceForm from '@/features/requests/components/request-service-form'
import { useRequestState } from '@/features/requests/store/request-store'
import Link from 'next/link'
import { ClipboardList, UserCheck, CheckCircle, Lightbulb, ShieldCheck } from 'lucide-react'

export default function RequestServicePage() {
  const { lastRequest } = useRequestState()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="px-6 py-8 sm:px-8">
          <h1 className="text-3xl font-bold">Demander un service</h1>
          <p className="mt-2 text-primary-50">Créez une demande et nous vous mettrons en relation avec des prestataires qualifiés.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">1. Décrivez votre besoin</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <UserCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">2. Recevez des candidatures</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <CheckCircle className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">3. Acceptez et finalisez</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <RequestServiceForm />
        </div>
        <aside className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24 lg:max-h-[420px] lg:overflow-auto">
          <h2 className="text-lg font-semibold text-gray-900">Conseils pour une demande efficace</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary-600 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-gray-700">Soyez précis: problème, modèle, symptômes, disponibilités.</span>
            </li>
            <li className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-primary-600 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-gray-700">Choisissez une catégorie adaptée pour des candidatures pertinentes.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-gray-700">Numéro correct pour faciliter le contact.</span>
            </li>
          </ul>
          <div className="mt-5 rounded-lg border border-yellow-100 bg-yellow-50 p-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-yellow-600 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-yellow-800">La demande se clôture 1h après l’heure si non acceptée.</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm text-gray-600">Besoin d’aide ? Consultez votre <Link className="text-primary-600 hover:underline" href="/history">historique</Link> ou <Link className="text-primary-600 hover:underline" href="/contact">contactez le support</Link>.</p>
          </div>
        </aside>
      </div>

      {lastRequest && (
        <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6" aria-live="polite">
          <h2 className="text-lg font-semibold text-gray-900">Dernière demande</h2>
          <p className="mt-1 text-gray-700">Identifiant : <code className="font-mono">{lastRequest.id}</code></p>
          <p className="mt-1 text-gray-700">Catégorie : {lastRequest.category}</p>
          <p className="mt-1 text-gray-700">Statut : {lastRequest.status}</p>
          <p className="mt-3 text-sm text-gray-600">Vous pouvez suivre l’avancement depuis la page <Link className="text-primary-600 hover:underline" href="/history">Historique</Link>.</p>
        </div>
      )}
    </section>
  )
}