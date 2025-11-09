"use client"

import React from 'react'
import type { RequestStatus } from '@darigo/shared-types'
import clsx from 'clsx'

export interface HistoryFiltersProps {
  status?: RequestStatus
  onChangeStatus: (s?: RequestStatus) => void
}

const STATUS_OPTIONS: { value?: RequestStatus; label: string }[] = [
  { value: undefined, label: 'Tous les statuts' },
  { value: 'open', label: 'Ouverte' },
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptée' },
  { value: 'completed', label: 'Terminée' },
  { value: 'closed', label: 'Fermée' },
]

export function HistoryFilters({ status, onChangeStatus }: HistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label htmlFor="status" className="text-sm font-medium text-gray-700">
        Filtrer par statut
      </label>
      <select
        id="status"
        name="status"
        className={clsx(
          'w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        )}
        value={status ?? ''}
        onChange={(e) => {
          const v = e.target.value as RequestStatus
          onChangeStatus(v === '' ? undefined : v)
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ''}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default HistoryFilters