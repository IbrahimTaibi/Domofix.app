"use client"

import React from "react"
import { ClipboardList } from "lucide-react"

export default function ProviderDashboardPage() {
  return (
    <section aria-labelledby="provider-dashboard-heading">
      <h1 id="provider-dashboard-heading" className="sr-only">Tableau de bord prestataire</h1>

      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Bienvenue sur votre</p>
            <h2 className="text-xl font-semibold text-gray-900">Tableau de bord prestataire</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Aperçu</h3>
          <p className="text-sm text-gray-600">Configurez vos sections et widgets ici.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Activité</h3>
          <p className="text-sm text-gray-600">Statistiques et informations à venir.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Paramètres</h3>
          <p className="text-sm text-gray-600">Gérez vos préférences et votre profil.</p>
        </div>
      </div>
    </section>
  )
}