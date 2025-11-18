"use client"

import React from 'react'
import { Users, TrendingDown } from 'lucide-react'

export interface SidebarStatsProps {
  providerCount: number
  avgPrice?: number | null
  minPrice?: number | null
  earliestEts?: number | null
}

export default function SidebarStats({ providerCount, minPrice }: SidebarStatsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Résumé</h2>
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Prestataires</span>
          </span>
          <span className="font-semibold text-gray-900">{providerCount}</span>
        </div>
        {minPrice != null && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span>À partir de</span>
            </span>
            <span className="font-semibold text-green-700">{minPrice} DT</span>
          </div>
        )}
      </div>
    </div>
  )
}