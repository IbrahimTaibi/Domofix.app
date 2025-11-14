import React from 'react'
import { motion } from 'framer-motion'
import type { KPIItem } from './types'
import Sparkline from './charts/sparkline'

export default function KPICards({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((k, i) => (
        <motion.div key={k.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{k.title}</div>
            {k.icon && <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{k.icon}</div>}
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{k.value}</div>
          {k.delta && <div className="mt-1 text-xs text-primary-700">{k.delta}</div>}
          {k.series && <div className="mt-2"><Sparkline data={k.series} /></div>}
        </motion.div>
      ))}
    </div>
  )
}
