import React from 'react'
import type { RequestStatus } from '@domofix/shared-types'
import clsx from 'clsx'

export interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

const LABELS: Record<RequestStatus, string> = {
  open: 'Ouverte',
  pending: 'En attente',
  accepted: 'Acceptée',
  completed: 'Terminée',
  closed: 'Fermée',
}

const COLORS: Record<RequestStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  accepted: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-gray-100 text-gray-700 ring-gray-500/10',
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        COLORS[status],
        className,
      )}
      aria-label={`Statut: ${LABELS[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}

