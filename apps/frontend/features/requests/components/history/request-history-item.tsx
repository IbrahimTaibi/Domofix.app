import React from 'react'
import type { Request } from '@domofix/shared-types'
import { RequestStatus } from '@domofix/shared-types'
import { CalendarClock, Phone, MapPin, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import RequestStatusBadge from './request-status-badge'
import { categoryOptions } from '../../services/requests-service'
import clsx from 'clsx'
import Link from 'next/link'
import { trackEvent } from '@/shared/utils/analytics'

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
  const applicationsMeta = (request as any)?.applicationsMeta || {}

  // Check if request has been accepted (has an order)
  const orderId = (request as any)?.orderId
  const hasOrder = !!orderId

  function getInitials(name: string): string {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    const first = parts[0]?.[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return (first + last).toUpperCase() || '?'
  }

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
  const applications = Array.isArray((request as any)?.applications) ? (request as any).applications : []
  const recentApplications = applications
    .slice()
    .sort((a: any, b: any) => {
      const ad = a?.appliedAt ? new Date(a.appliedAt).getTime() : 0
      const bd = b?.appliedAt ? new Date(b.appliedAt).getTime() : 0
      return bd - ad
    })
    .slice(0, 3)

  // Determine the correct link:
  // - If has order (accepted) → go to order page
  // - If no order (open/pending) → go to providers page to see applications
  const linkHref = hasOrder ? `/orders/${orderId}` : `/services/${id}/providers`

  return (
    <Link
      href={linkHref}
      prefetch={false}
      onClick={() => trackEvent('history_card_click', { requestId: id, category: String(request?.category), hasOrder })}
    >
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
        <div className="flex items-center gap-3">
          {request?.status && <RequestStatusBadge status={request.status} className="mt-0.5" />}
        </div>
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

      <div className="mt-3 flex w-full items-center justify-end gap-2">
        <div className="text-xs text-gray-600">Candidatures: {applications.length}</div>
        {recentApplications.length ? (
          <div className="flex -space-x-2">
            {recentApplications.map((app: any, idx: number) => {
              const meta = applicationsMeta?.[app?.providerId] || {}
              const avatar = meta?.avatar || ''
              const name = meta?.name || ''
              return avatar ? (
                <img
                  key={`${app?.providerId || idx}-row-img`}
                  src={avatar}
                  alt={name || 'Applicant'}
                  title={name || ''}
                  className="h-6 w-6 rounded-full border border-white object-cover"
                  loading="lazy"
                />
              ) : (
                <span
                  key={`${app?.providerId || idx}-row-init`}
                  title={name || ''}
                  className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 text-[10px] font-medium inline-flex items-center justify-center border border-white"
                >
                  {getInitials(name)}
                </span>
              )
            })}
          </div>
        ) : null}
      </div>

      {id ? (
        <div className="mt-4 text-xs text-gray-500">ID: {id}</div>
      ) : null}

    </article>
    </Link>
  )
}

export default RequestHistoryItem
