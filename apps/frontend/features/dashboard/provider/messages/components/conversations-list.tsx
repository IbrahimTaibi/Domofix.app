"use client"
import React, { useMemo, useState } from 'react'
import type { ThreadSummary } from '../../messages/types'
import { NotificationDot } from '@/shared/components'

interface Props {
  threads: ThreadSummary[]
  activeId: string | null
  onSelect: (id: string) => void
}

export default function ConversationsList({ threads, activeId, onSelect }: Props) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return threads
    return threads.filter(t => t.title.toLowerCase().includes(s) || t.lastMessage.toLowerCase().includes(s))
  }, [q, threads])

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher"
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <ul className="flex-1 overflow-y-auto space-y-1 p-2">
        {filtered.map((t) => {
          const active = t.id === activeId
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 border ${active ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="relative inline-flex">
                  <img src={t.avatarUrl} alt={t.title} className="w-10 h-10 rounded-full object-cover" />
                  {t.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5"><NotificationDot size="sm" /></span>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">{new Date(t.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{t.lastMessage}</p>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

