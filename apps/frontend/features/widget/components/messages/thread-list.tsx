"use client"

import React from 'react'
import { useMessagesStore } from '@/features/widget/store/messages-store'
import { useAuthStore } from '@/features/auth/store/auth-store'

export default function ThreadList() {
  const threads = useMessagesStore((s) => s.threads)
  const messagesByThread = useMessagesStore((s) => s.messagesByThread)
  const setActiveThread = useMessagesStore((s) => s.setActiveThread)
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <ul className="divide-y">
      {threads.map((t) => {
        const msgs = messagesByThread[t.id] || []
        const last = msgs[msgs.length - 1]
        const otherParticipant = t.participants.find((p) => p.id !== user.id)
        const preview = last?.text || 'Aucun message'
        const time = last ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        const initial = (otherParticipant?.name || 'U').charAt(0).toUpperCase()

        return (
          <li key={t.id}>
            <button
              onClick={() => setActiveThread(t.id, user.id)}
              className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="relative">
                  <span className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center">
                    {otherParticipant?.avatarUrl ? (
                      <img src={otherParticipant.avatarUrl} alt={otherParticipant?.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">{initial}</span>
                    )}
                  </span>
                  {t.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                      {t.unreadCount > 9 ? '9+' : t.unreadCount}
                    </span>
                  )}
                </div>
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