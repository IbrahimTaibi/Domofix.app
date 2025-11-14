import React from 'react'
import type { Request, RequestStatus } from '@darigo/shared-types'
import { CalendarClock, Phone, MapPin, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import StatusBadge from '@/shared/components/requests/status-badge'
import MetaRow from '@/shared/components/requests/meta-row'
import clsx from 'clsx'
import Button from '@/shared/components/button'
import { categoryOptions } from '@/features/requests/services/requests-service'
import { motion } from 'framer-motion'

function getDisplayId(req: any): string {
  return (req?.id || req?._id || '') as string
}

function getCategoryLabel(value: string): string {
  const opt = categoryOptions.find((o) => String(o.value) === String(value))
  return opt?.label || (value ? value.charAt(0).toUpperCase() + value.slice(1) : '')
}

export interface RequestCardProps {
  request: Request | any
  className?: string
  currentProviderId?: string
  onApply?: (request: any) => void
  onView?: (request: any) => void
  appliedOverride?: boolean
  statusOverride?: RequestStatus
}

const STATUS_ACCENT: Record<RequestStatus, string> = {
  open: 'border-l-blue-500',
  pending: 'border-l-amber-500',
  accepted: 'border-l-violet-500',
  completed: 'border-l-emerald-500',
  closed: 'border-l-gray-400',
}


function RequestCardInner({ request, className, currentProviderId, onApply, onView, appliedOverride, statusOverride }: RequestCardProps) {
  const id = getDisplayId(request)
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null
  const ets = request?.estimatedTimeOfService ? new Date(request.estimatedTimeOfService) : null
  const details = typeof request?.details === 'string' ? request.details : ''
  const status: RequestStatus | undefined = (statusOverride as RequestStatus) || (request?.status as RequestStatus)
  const accentClass = status ? STATUS_ACCENT[status as RequestStatus] : 'border-l-gray-200'
  const apps: any[] = Array.isArray(request?.applications) ? request.applications : []
  const appliedComputed = currentProviderId ? apps.some((a: any) => String(a?.providerId) === String(currentProviderId)) : false
  const applied = !!appliedOverride || appliedComputed
  const canApply = !!onApply && (status === 'open' || status === 'pending') && !applied
  const ANIMATION_DURATION = 250

  return (
    <motion.article
      className={clsx(
        'group rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md border-gray-200 border-l-4 h-full flex flex-col transition-colors',
        accentClass,
        className,
      )}
      initial={false}
      animate={{ scale: applied ? 1.005 : 1 }}
      transition={{ duration: ANIMATION_DURATION / 1000 }}
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{getCategoryLabel(String(request?.category))}</h3>
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {createdAt && (
          <MetaRow icon={<CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />} label="Créée" value={format(createdAt, 'dd/MM/yyyy HH:mm')} />
        )}
        {ets && (
          <MetaRow icon={<CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />} label="Intervention" value={format(ets, 'dd/MM/yyyy HH:mm')} />
        )}
      </div>

      <div className="mt-auto">
        {request?.location?.address ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
              <MapPin className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </span>
            <span className="truncate">{request.location.address}</span>
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          {id ? <div className="text-xs text-gray-500">ID: {id}</div> : <span />}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="whitespace-nowrap" aria-label="Voir" onClick={() => onView?.(request)}>Voir</Button>
            {onApply ? (
              applied ? (
                <Button variant="secondary" size="sm" className="whitespace-nowrap" disabled aria-label="Déjà candidat">Déjà candidat</Button>
              ) : (
                <Button variant="primary" size="sm" className="whitespace-nowrap" onClick={() => onApply(request)} aria-label="Postuler">Postuler</Button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default React.memo(RequestCardInner)
