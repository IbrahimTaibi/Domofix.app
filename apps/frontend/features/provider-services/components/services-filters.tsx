"use client"

import React from 'react'
import { Search, Filter } from 'lucide-react'
import { ServiceStatus } from '@/features/provider-services/services/provider-services-api'

interface ServicesFiltersProps {
  currentStatus?: ServiceStatus
  onStatusChange: (status: ServiceStatus | 'all') => void
  onSearch: (search: string) => void
}

export default function ServicesFilters({
  currentStatus,
  onStatusChange,
  onSearch,
}: ServicesFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={currentStatus || 'all'}
            onChange={(e) => onStatusChange(e.target.value as ServiceStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value={ServiceStatus.ACTIVE}>Actif</option>
            <option value={ServiceStatus.INACTIVE}>Inactif</option>
            <option value={ServiceStatus.DRAFT}>Brouillon</option>
          </select>
        </div>
      </div>
    </div>
  )
}
