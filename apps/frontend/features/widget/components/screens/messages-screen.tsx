"use client"

import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useMessagesStore } from '@/features/widget/store/messages-store'
import ThreadList from '@/features/widget/components/messages/thread-list'
import ConversationView from '@/features/widget/components/messages/conversation-view'

export default function MessagesScreen() {
  const threads = useMessagesStore((s) => s.threads)
  const active = useMessagesStore((s) => s.activeThreadId)
  if (!threads || threads.length === 0) {
    return (
      <section aria-labelledby="widget-messages-title" className="h-full flex items-center justify-center p-4">
        <div className="rounded-xl bg-white p-8 text-center max-w-sm w-full">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400" aria-hidden="true" />
          <div className="mt-3 text-base font-semibold text-gray-900">Aucun message</div>
          <p className="mt-2 text-sm text-gray-600">Toutes vos conversations s’afficheront ici.</p>
        </div>
      </section>
    )
  }
  return (
    <section aria-labelledby="widget-messages-title" className="h-full p-4 pb-24 md:pb-4">
      {active ? <ConversationView /> : <ThreadList />}
    </section>
  )
}