import React from 'react'
import type { Request } from '@darigo/shared-types'
import { CalendarClock, Phone, MapPin, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import RequestStatusBadge from './request-status-badge'
import { categoryOptions } from '../../services/requests-service'

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

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-900">
            {getCategoryLabel(String(request?.category))}
          </h3>
        </div>
        {request?.status && <RequestStatusBadge status={request.status} />}
      </div>

      {details ? (
        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{details}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
        {createdAt && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span>Créée: {format(createdAt, 'dd/MM/yyyy HH:mm')}</span>
          </div>
        )}
        {ets && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span>Intervention: {format(ets, 'dd/MM/yyyy HH:mm')}</span>
          </div>
        )}
        {request?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{request.phone}</span>
          </div>
        )}
      </div>

      {request?.location?.address ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span className="truncate">{request.location.address}</span>
        </div>
      ) : null}

      {/* Optional actions could go here */}
      {id ? (
        <div className="mt-3 text-xs text-gray-500">ID: {id}</div>
      ) : null}
    </article>
  )
}

export default RequestHistoryItem