"use client"

import React, { useEffect, useRef } from 'react'
import { useMessagesStore } from '@/features/widget/store/messages-store'
import { ChevronLeft } from 'lucide-react'

export default function ConversationView() {
  const activeId = useMessagesStore((s) => s.activeThreadId)
  const messages = useMessagesStore((s) => s.messagesByThread[activeId || ''] || [])
  const participants = useMessagesStore((s) => s.participants)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight })
    }
  }, [messages.length])
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white pb-24 md:pb-0" ref={scrollRef}>
        {messages.map((m) => {
          const isMe = m.senderId === 'me'
          const p = participants[m.senderId]
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} py-1`}>
              {!isMe && (
                <span className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center mr-2">
                  {p?.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p?.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">{(p?.name || 'U').charAt(0)}</span>
                  )}
                </span>
              )}
              <div className={`max-w-[80%] px-3 py-2 ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl shadow-sm`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                <div className={`text-[11px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-600'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}