"use client"

import React from 'react'
import { Users } from 'lucide-react'

export interface SidebarStatsProps {
  providerCount: number
  avgPrice?: number | null
  minPrice?: number | null
  earliestEts?: number | null
}

export default function SidebarStats({ providerCount, avgPrice, minPrice, earliestEts }: SidebarStatsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">Résumé</h2>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" /> Prestataires
          </span>
          <span className="font-medium">{providerCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Prix moyen</span>
          <span className="font-medium">{avgPrice != null ? `${Math.round(avgPrice)} DT` : '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Prix minimum</span>
          <span className="font-medium">{minPrice != null ? `${minPrice} DT` : '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ETS le plus tôt</span>
          <span className="font-medium">{earliestEts ? new Date(earliestEts).toLocaleString() : '—'}</span>
        </div>
      </div>
    </div>
  )
}