"use client"

import React from 'react'

export default function SidebarSafety() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <h2 className="text-sm font-semibold">Conseils de sécurité</h2>
      <ul className="mt-2 space-y-1 text-xs">
        <li>• Les transactions ne sont pas protégées par l’application.</li>
        <li>• Vérifiez l’identité et les avis du prestataire.</li>
        <li>• Précisez le prix et l’ETS proposés avant de confirmer.</li>
        <li>• Évitez les paiements anticipés non sécurisés.</li>
        <li>• Après approbation, un chat s’ouvre pour échanger directement avec le prestataire.</li>
      </ul>
    </div>
  )
}