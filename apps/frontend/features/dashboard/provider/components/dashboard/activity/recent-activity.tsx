import React from 'react'
import { ClipboardList, MessageSquare, CheckCircle2 } from 'lucide-react'
import type { ActivityItem } from '../types'

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Activité récente</div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.timestamp} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              {it.type === 'request' && <ClipboardList className="w-4 h-4 text-primary-700" />}
              {it.type === 'order' && <CheckCircle2 className="w-4 h-4 text-primary-700" />}
              {it.type === 'message' && <MessageSquare className="w-4 h-4 text-primary-700" />}
            </div>
            <div>
              <div className="text-sm text-gray-900">{it.title}</div>
              <div className="text-xs text-gray-500">{new Date(it.timestamp).toLocaleString('fr-FR')}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
