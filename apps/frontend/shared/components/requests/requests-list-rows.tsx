import React from 'react'
import type { Request } from '@darigo/shared-types'
import StatusBadge from '@/shared/components/requests/status-badge'
import Button from '@/shared/components/button'
import { CalendarClock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { categoryOptions } from '@/features/requests/services/requests-service'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface RequestsListRowsProps {
  items: (Request | any)[]
  currentProviderId?: string
  onApply?: (req: any) => void
  onView?: (req: any) => void
  appliedIds?: Set<string>
  statusOverrideById?: Record<string, RequestStatus>
}

export default function RequestsListRows({ items, currentProviderId, onApply, onView, appliedIds, statusOverrideById }: RequestsListRowsProps) {
  if (!items?.length) return null
  return (
    <div className="divide-y divide-gray-200">
      {items.map((req: any) => {
        const id = String(req?.id || req?._id || '')
        const createdAt = req?.createdAt ? new Date(req.createdAt) : null
        const ets = req?.estimatedTimeOfService ? new Date(req.estimatedTimeOfService) : null
        const apps: any[] = Array.isArray(req?.applications) ? req.applications : []
        const appliedComputed = currentProviderId ? apps.some((a: any) => String(a?.providerId) === String(currentProviderId)) : false
        const applied = appliedIds?.has(id) || appliedComputed
        const status = (statusOverrideById ? statusOverrideById[id] : undefined) || req?.status
        const canApply = !!onApply && (status === 'open' || status === 'pending') && !applied
        const catLabel = (() => {
          const opt = categoryOptions.find((o) => String(o.value) === String(req?.category))
          const raw = String(req?.category || '')
          return opt?.label || (raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '')
        })()
        const STATUS_ACCENT: Record<string, string> = {
          open: 'border-l-blue-500',
          pending: 'border-l-amber-500',
          accepted: 'border-l-violet-500',
          completed: 'border-l-emerald-500',
          closed: 'border-l-gray-400',
        }
        return (
          <motion.div
            key={id || Math.random()}
            className={clsx(
              'px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3 border-l-4',
              applied && status ? STATUS_ACCENT[String(status)] : 'border-l-transparent'
            )}
            initial={false}
            animate={{ scale: applied ? 1.005 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 truncate">{catLabel}</span>
                {status ? <StatusBadge status={status} /> : null}
                {id ? <span className="text-xs text-gray-500">ID: {id}</span> : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {createdAt && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700"><CalendarClock className="h-3 w-3" /> {format(createdAt, 'dd/MM/yyyy HH:mm')}</span>
                )}
                {ets && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700"><CalendarClock className="h-3 w-3" /> {format(ets, 'dd/MM/yyyy HH:mm')}</span>
                )}
                {req?.location?.address && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700 max-w-full"><MapPin className="h-3 w-3" /> <span className="truncate max-w-[240px]">{req.location.address}</span></span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="whitespace-nowrap w-24" onClick={() => onView?.(req)}>Voir</Button>
              {onApply ? (
                applied ? (
                  <Button variant="secondary" size="sm" className="whitespace-nowrap w-28" disabled>
                    Déjà candidat
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" className="whitespace-nowrap w-28" onClick={() => onApply(req)} disabled={!canApply}>
                    Postuler
                  </Button>
                )
              ) : null}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
