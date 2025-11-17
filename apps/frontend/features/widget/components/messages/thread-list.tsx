"use client"

import React from 'react'
import { useMessagesStore } from '@/features/widget/store/messages-store'

export default function ThreadList() {
  const threads = useMessagesStore((s) => s.threads)
  const participants = useMessagesStore((s) => s.participants)
  const messagesByThread = useMessagesStore((s) => s.messagesByThread)
  const setActive = useMessagesStore((s) => s.setActiveThread)

  return (
    <ul className="divide-y">
      {threads.map((t) => {
        const msgs = messagesByThread[t.id] || []
        const last = msgs[msgs.length - 1]
        const otherId = t.participantIds.find((id) => id !== 'me') || t.participantIds[0]
        const p = participants[otherId]
        const preview = last?.text || '…'
        const time = last ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        return (
          <li key={t.id}>
            <button onClick={() => setActive(t.id)} className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center">
                  {p?.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p?.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">{(p?.name || 'U').charAt(0)}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900 truncate">{t.title}</div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">{time}</div>
                  </div>
                  <div className="mt-0.5 text-sm text-gray-700 truncate">{preview}</div>
                </div>
                <div />
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}