"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Message, Participant } from '../../messages/types'
import MessageBubble from './message-bubble'
import TypingIndicator from './typing-indicator'
import { useMessagesSocket } from '@/shared/hooks/use-messages-socket'
import { useMessagesStore } from '../../messages/store'

interface Props {
  messages: Message[]
  me: Participant
}

export default function ChatWindow({ messages, me }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(15)
  const visibleMessages = useMemo(() => messages.slice(Math.max(0, messages.length - visibleCount)), [messages, visibleCount])
  const prevLenRef = useRef(messages.length)
  const prevVisRef = useRef(visibleCount)
  const addIncoming = useMessagesStore((s) => s.addIncoming)
  const activeThreadId = useMessagesStore((s) => s.activeThreadId)
  const { joinThread, leaveThread } = useMessagesSocket({ onNewMessage: ({ threadId, message }) => addIncoming({ threadId, message }) })

  useEffect(() => {
    const added = messages.length > prevLenRef.current
    const visChanged = visibleCount !== prevVisRef.current
    if (added && !visChanged) {
      ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
    }
    prevLenRef.current = messages.length
    prevVisRef.current = visibleCount
  }, [messages, visibleCount])

  useEffect(() => {
    if (!activeThreadId) return
    joinThread(activeThreadId)
    return () => { leaveThread(activeThreadId) }
  }, [activeThreadId, joinThread, leaveThread])

  const hasOlder = messages.length > visibleCount
  const allShown = visibleCount >= messages.length

  return (
    <div ref={ref} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
      {hasOlder && (
        <div className="flex justify-center">
          {!allShown ? (
            <button className="px-3 py-1 rounded border text-xs bg-white hover:bg-gray-50" onClick={() => setVisibleCount((c) => c + 15)}>Afficher plus</button>
          ) : (
            <button className="px-3 py-1 rounded border text-xs bg-white hover:bg-gray-50" onClick={() => setVisibleCount(15)}>Afficher moins</button>
          )}
        </div>
      )}
      {visibleMessages.map((m) => (
        <MessageBubble key={m.id} message={m} isMe={m.senderId === me.id} />
      ))}
      <TypingIndicator />
    </div>
  )
}
