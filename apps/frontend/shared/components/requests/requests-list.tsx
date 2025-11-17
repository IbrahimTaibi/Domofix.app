import React from 'react'
import type { Request } from '@darigo/shared-types'
import { motion, AnimatePresence } from 'framer-motion'
import RequestCard from '@/shared/components/requests/request-card'

export interface RequestsListProps {
  items: (Request | any)[]
  currentProviderId?: string
  onApply?: (req: any) => void
  onView?: (req: any) => void
  appliedIds?: Set<string>
  statusOverrideById?: Record<string, RequestStatus>
}

export default function RequestsList({ items, currentProviderId, onApply, onView, appliedIds, statusOverrideById }: RequestsListProps) {
  if (!items?.length) return null
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence mode="popLayout">
        {items.map((req: any) => (
          <motion.li
            key={req?.id || req?._id || Math.random()}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <RequestCard
              request={req}
              currentProviderId={currentProviderId}
              onApply={onApply}
              onView={onView}
              appliedOverride={appliedIds?.has(String(req?.id || req?._id || ''))}
              statusOverride={statusOverrideById ? statusOverrideById[String(req?.id || req?._id || '')] : undefined}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
