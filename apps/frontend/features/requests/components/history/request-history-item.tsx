import React from 'react'
import type { Request } from '@darigo/shared-types'
import { RequestStatus } from '@darigo/shared-types'
import { CalendarClock, Phone, MapPin, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import RequestStatusBadge from './request-status-badge'
import { categoryOptions } from '../../services/requests-service'
import clsx from 'clsx'

function getDisplayId(req: any): string {
  return (req?.id || req?._id || '') as string
}

function getCategoryLabel(value: string): string {
  const opt = categoryOptions.find((o) => String(o.value) === String(value))
  return opt?.label || value
}

export interface RequestHistoryItemProps {
  request: Request | any
}

export function RequestHistoryItem({ request }: RequestHistoryItemProps) {
  const id = getDisplayId(request)
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null
  const ets = request?.estimatedTimeOfService ? new Date(request.estimatedTimeOfService) : null
  const details = typeof request?.details === 'string' ? request.details : ''

  const STATUS_ACCENT: Record<RequestStatus, string> = {
    [RequestStatus.OPEN]: 'border-l-blue-500',
    [RequestStatus.PENDING]: 'border-l-amber-500',
    [RequestStatus.ACCEPTED]: 'border-l-violet-500',
    [RequestStatus.COMPLETED]: 'border-l-emerald-500',
    [RequestStatus.CLOSED]: 'border-l-gray-400',
  }
  const accentClass = request?.status
    ? STATUS_ACCENT[request.status as RequestStatus]
    : 'border-l-gray-200'

  return (
    <article
      className={clsx(
        'group rounded-xl border bg-white p-5 shadow-sm transition-shadow',
        'hover:shadow-md',
        'border-gray-200 border-l-4',
        accentClass,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold text-gray-900">
            {getCategoryLabel(String(request?.category))}
          </h3>
        </div>
        {request?.status && <RequestStatusBadge status={request.status} className="mt-0.5" />}
      </div>

      {details ? (
        <p className="mt-3 text-sm text-gray-700 line-clamp-3">{details}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
        {createdAt && (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
              <CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </span>
            <span>
              <span className="text-gray-500">Créée:</span> {format(createdAt, 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        )}
        {ets && (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
              <CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </span>
            <span>
              <span className="text-gray-500">Intervention:</span> {format(ets, 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        )}
        {request?.phone && (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
              <Phone className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </span>
            <span>{request.phone}</span>
          </div>
        )}
      </div>

      {request?.location?.address ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
            <MapPin className="h-4 w-4 text-gray-600" aria-hidden="true" />
          </span>
          <span className="truncate">{request.location.address}</span>
        </div>
      ) : null}

      {/* Optional actions could go here */}
      {id ? (
        <div className="mt-4 text-xs text-gray-500">ID: {id}</div>
      ) : null}
    </article>
  )
}

export default RequestHistoryItem