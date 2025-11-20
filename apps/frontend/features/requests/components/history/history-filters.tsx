"use client"

import React from 'react'
import { RequestStatus } from '@domofix/shared-types'
import clsx from 'clsx'

export interface HistoryFiltersProps {
  status?: RequestStatus
  onChangeStatus: (s?: RequestStatus) => void
}

const STATUS_OPTIONS: { value?: RequestStatus; label: string }[] = [
  { value: undefined, label: 'Tous les statuts' },
  { value: RequestStatus.OPEN, label: 'Ouverte' },
  { value: RequestStatus.PENDING, label: 'En attente' },
  { value: RequestStatus.ACCEPTED, label: 'Acceptée' },
  { value: RequestStatus.COMPLETED, label: 'Terminée' },
  { value: RequestStatus.CLOSED, label: 'Fermée' },
]

export function HistoryFilters({ status, onChangeStatus }: HistoryFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="status" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Filtrer par statut
      </label>
      <select
        id="status"
        name="status"
        className={clsx(
          'flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        )}
        value={String(status ?? '')}
        onChange={(e) => {
          const raw = e.target.value
          onChangeStatus(raw === '' ? undefined : (raw as RequestStatus))
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