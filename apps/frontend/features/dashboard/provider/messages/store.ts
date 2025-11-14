"use client"
import { create } from 'zustand'
import type { ThreadSummary, Message, Participant } from './types'
import type { ChatMessage, ThreadSummary as BackendThread } from '@darigo/shared-types'
import { listThreads, listMessages, sendMessage as sendMessageApi } from './svc/messages-service'

interface MessagesState {
  threads: ThreadSummary[]
  participants: Participant[]
  activeThreadId: string | null
  messages: Record<string, Message[]>
  setActiveThread: (id: string) => void
  sendMessage: (threadId: string, text: string) => void
  addIncoming: (payload: { threadId: string; message: ChatMessage }) => void
  init: () => Promise<void>
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  threads: [],
  participants: [],
  activeThreadId: null,
  messages: {},
  setActiveThread: async (id) => {
    const current = get().activeThreadId
    const existing = get().messages[id]
    if (current === id && existing && existing.length > 0) return
    set({ activeThreadId: id })
    const msgs = await listMessages(id)
    const mapped: Message[] = msgs.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      senderId: m.senderId,
      senderName: get().participants.find((p) => p.id === m.senderId)?.name || 'Utilisateur',
      kind: m.kind,
      text: m.text,
      imageUrl: m.imageUrl,
      file: m.fileMeta ? { name: m.fileMeta.name, size: m.fileMeta.size, url: '' } : undefined,
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : (m.createdAt as Date).toISOString(),
      status: m.status,
    }))
    set((state) => ({ messages: { ...state.messages, [id]: mapped } }))
  },
  sendMessage: async (threadId, text) => {
    const me = get().participants.find((p) => p.role === 'provider')
    if (!me) return
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      threadId,
      senderId: me.id,
      senderName: me.name,
      senderAvatarUrl: me.avatarUrl,
      kind: 'text',
      text,
      createdAt: new Date().toISOString(),
      status: 'sent',
    }
    set((state) => ({ messages: { ...state.messages, [threadId]: [...(state.messages[threadId] || []), optimistic] } }))
    try {
      await sendMessageApi(threadId, { kind: 'text', text })
    } catch {
      // could revert optimistic
    }
  },
  addIncoming: ({ threadId, message }) => set((state) => {
    const list = state.messages[threadId] || []
    const msg: Message = {
      id: message.id,
      threadId,
      senderId: message.senderId,
      senderName: state.participants.find((p) => p.id === message.senderId)?.name || 'Utilisateur',
      kind: message.kind,
      text: message.text,
      imageUrl: message.imageUrl,
      file: message.fileMeta ? { name: message.fileMeta.name, size: message.fileMeta.size, url: '' } : undefined,
      createdAt: typeof message.createdAt === 'string' ? message.createdAt : (message.createdAt as Date).toISOString(),
      status: message.status,
    }
    return { messages: { ...state.messages, [threadId]: [...list, msg] } }
  }),
  init: async () => {
    const backendThreads = await listThreads()
    const btArr = Array.isArray(backendThreads) ? backendThreads : []
    const threads: ThreadSummary[] = btArr.map((t) => {
      const custId = t.participants.find((p) => p.role === 'customer')?.userId || ''
      const meta = t.participantMeta || {}
      const custMeta = custId ? meta[custId] : undefined
      return {
        id: t.id,
        title: custMeta?.name || `Client ${custId.slice(-4)}`,
        avatarUrl: custMeta?.avatar || '',
        lastMessage: '',
        lastTime: t.lastMessageAt ? new Date(t.lastMessageAt as any).toLocaleString() : '',
        unreadCount: Object.values(t.unreadCounts || {}).reduce((a, b) => a + (b || 0), 0),
      }
    })
    const participants: Participant[] = []
    participants.push({ id: 'me', name: 'Provider', avatarUrl: '', role: 'provider' })
    for (const bt of btArr) {
      const cust = bt.participants.find((p) => p.role === 'customer')
      const meta = bt.participantMeta || {}
      const avatar = cust?.userId ? (meta[cust.userId]?.avatar || '') : ''
      const name = cust?.userId ? (meta[cust.userId]?.name || `Client ${cust.userId.slice(-4)}`) : 'Client'
      if (cust && !participants.find((p) => p.id === cust.userId)) {
        participants.push({ id: cust.userId, name, avatarUrl: avatar, role: 'customer' })
      }
    }
    set({ threads, participants, activeThreadId: threads[0]?.id || null })
    if (threads[0]?.id) {
      await get().setActiveThread(threads[0].id)
    }
  },
}))
