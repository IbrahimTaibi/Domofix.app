"use client"

import React from 'react'
import { Shield } from 'lucide-react'

export default function SidebarSafety() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4" />
        <h2 className="text-sm font-semibold">Conseils de sécurité</h2>
      </div>
      <ul className="space-y-1.5 text-xs leading-relaxed">
        <li>• Vérifiez les avis et l'expérience du prestataire</li>
        <li>• Confirmez le prix et la date avant d'approuver</li>
        <li>• Utilisez le chat pour clarifier les détails</li>
      </ul>
    </div>
  )
}