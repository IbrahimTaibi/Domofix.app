import React from 'react'
import type { Request } from '@domofix/shared-types'
import { motion, AnimatePresence } from 'framer-motion'
import RequestHistoryItem from './request-history-item'

export interface RequestHistoryListProps {
  items: (Request | any)[]
}

export function RequestHistoryList({ items }: RequestHistoryListProps) {
  if (!items?.length) return null
  return (
    <ul className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map((req) => (
          <motion.li
            key={(req as any)?.id || (req as any)?._id || Math.random()}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <RequestHistoryItem request={req} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

export default RequestHistoryList