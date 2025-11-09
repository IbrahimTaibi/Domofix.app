import React from 'react'
import type { RequestStatus } from '@darigo/shared-types'
import clsx from 'clsx'

export interface RequestStatusBadgeProps {
  status: RequestStatus
  className?: string
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  open: 'Ouverte',
  pending: 'En attente',
  accepted: 'Acceptée',
  completed: 'Terminée',
  closed: 'Fermée',
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-violet-50 text-violet-700 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
      aria-label={`Statut: ${STATUS_LABEL[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export default RequestStatusBadge