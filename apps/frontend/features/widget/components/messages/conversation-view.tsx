"use client"

import React, { useEffect, useRef } from 'react'
import { useMessagesStore } from '@/features/widget/store/messages-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Info } from 'lucide-react'

export default function ConversationView() {
  const activeId = useMessagesStore((s) => s.activeThreadId)
  const messages = useMessagesStore((s) => s.messagesByThread[activeId || ''] || [])
  const threads = useMessagesStore((s) => s.threads)
  const isLoadingMessages = useMessagesStore((s) => s.isLoadingMessages[activeId || ''])
  const user = useAuthStore((s) => s.user)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length])

  if (!user) return null

  const thread = threads.find((t) => t.id === activeId)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white pb-24 md:pb-0" ref={scrollRef}>
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Chargement...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Aucun message</div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user.id
            const isSystem = m.senderId === 'system'
            const participant = thread?.participants.find((p) => p.id === m.senderId)
            const initial = (participant?.name || 'U').charAt(0).toUpperCase()

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center py-2">
                  <div className="max-w-[85%] px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">{m.text}</p>
                  </div>
                </div>
              )
            }

            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} py-1`}>
                {!isMe && (
                  <span className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center mr-2 flex-shrink-0">
                    {participant?.avatarUrl ? (
                      <img src={participant.avatarUrl} alt={participant?.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">{initial}</span>
                    )}
                  </span>
                )}
                <div className={`max-w-[80%] px-3 py-2 ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl shadow-sm`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="Image" className="mt-2 rounded-lg max-w-full" />
                  )}
                  <div className={`text-[11px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-600'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}