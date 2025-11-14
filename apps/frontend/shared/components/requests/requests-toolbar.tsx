"use client"

import React from 'react'
import { RefreshCw } from 'lucide-react'
import FiltersBar from '@/shared/components/requests/filters-bar'
import type { RequestStatus, ServiceCategory } from '@darigo/shared-types'

export interface RequestsToolbarProps {
  status?: RequestStatus
  category?: ServiceCategory
  search?: string
  sort?: 'newest' | 'eta' | 'category'
  onChange: (next: { status?: RequestStatus; category?: ServiceCategory; search?: string; sort?: 'newest' | 'eta' | 'category' }) => void
  onRefresh: () => void
  viewMode?: 'grid' | 'list'
  onChangeViewMode?: (m: 'grid' | 'list') => void
}

export default function RequestsToolbar({ status, category, search, sort, onChange, onRefresh, viewMode = 'grid', onChangeViewMode }: RequestsToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <FiltersBar status={status} category={category} search={search} sort={sort} onChange={onChange} />
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => onChangeViewMode?.('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700'}`}
              aria-label="Vue grille"
            >
              Grille
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode?.('list')}
              className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700'}`}
              aria-label="Vue liste"
            >
              Liste
            </button>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
            aria-label="Rafraîchir la liste"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
      </div>
    </div>
  )
}
