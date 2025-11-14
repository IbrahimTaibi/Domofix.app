"use client"
import React from 'react'
import { useMessagesStore } from '@/features/dashboard/provider/messages/store'
import ConversationsList from '@/features/dashboard/provider/messages/components/conversations-list'
import ChatHeader from '@/features/dashboard/provider/messages/components/chat-header'
import ChatWindow from '@/features/dashboard/provider/messages/components/chat-window'
import ChatComposer from '@/features/dashboard/provider/messages/components/chat-composer'
import DetailsPanel from '@/features/dashboard/provider/messages/components/details-panel'
import { useToastStore } from '@/shared/store/toast-store'

export default function ProviderMessagesPage() {
  const threads = useMessagesStore((s) => s.threads)
  const participants = useMessagesStore((s) => s.participants)
  const activeId = useMessagesStore((s) => s.activeThreadId)
  const messagesMap = useMessagesStore((s) => s.messages)
  const setActive = useMessagesStore((s) => s.setActiveThread)
  const sendMessage = useMessagesStore((s) => s.sendMessage)
  const init = useMessagesStore((s) => (s as any).init)
  const { show } = useToastStore()
  const didInitRef = React.useRef(false)
  React.useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    init().catch((err: any) => {
      const msg = typeof err?.message === 'string' ? err.message : 'Impossible de charger les conversations'
      show({ message: msg, variant: 'error' })
    })
  }, [init, show])

  const me = participants.find((p) => p.role === 'provider') || null
  const activeMessages = activeId ? (messagesMap[activeId] || []) : []
  const customerName = threads.find(t => t.id === activeId)?.title || ''
  const customer = participants.find(p => p.name === customerName) || null

  return (
    <section aria-labelledby="provider-messages-heading" className="min-h-[60vh] overflow-x-hidden">
      <h1 id="provider-messages-heading" className="sr-only">Messages</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[20rem_1.6fr_22rem] bg-gray-50">
        <aside className="border-r bg-white">
          <ConversationsList threads={threads} activeId={activeId} onSelect={setActive} />
        </aside>
        <div className="flex flex-col min-h-[60vh]">
          <ChatHeader participant={customer ?? undefined} />
          {me ? (
            <ChatWindow messages={activeMessages} me={me} />
          ) : (
            <div className="flex-1 bg-white" />
          )}
          <ChatComposer onSend={(text) => { if (activeId) sendMessage(activeId, text) }} disabled={!activeId} />
        </div>
        <DetailsPanel participant={customer || { id: '', name: 'Client', avatarUrl: '', role: 'customer' }} messages={activeMessages} />
      </div>
    </section>
  )
}
