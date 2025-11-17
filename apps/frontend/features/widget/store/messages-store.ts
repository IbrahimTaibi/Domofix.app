"use client"

import { create } from 'zustand'
import type { WidgetThread, WidgetMessage, WidgetParticipant } from '@/features/widget/mock/messages-mock'
import { threads as initialThreads, messagesByThread as initialMessages, participants as initialParticipants } from '@/features/widget/mock/messages-mock'

interface MessagesState {
  threads: WidgetThread[]
  participants: Record<string, WidgetParticipant>
  messagesByThread: Record<string, WidgetMessage[]>
  activeThreadId: string | null
  setActiveThread: (id: string) => void
  backToList: () => void
  addMessage: (text: string) => void
}

export const useMessagesStore = create<MessagesState>((set) => ({
  threads: initialThreads,
  participants: initialParticipants,
  messagesByThread: initialMessages,
  activeThreadId: null,
  setActiveThread: (id) => set({ activeThreadId: id }),
  backToList: () => set({ activeThreadId: null }),
  addMessage: (text) => set((s) => {
    const tid = s.activeThreadId
    if (!tid) return {}
    const msg = {
      id: `${tid}-${Date.now()}`,
      threadId: tid,
      senderId: 'me',
      text,
      createdAt: new Date().toISOString(),
    }
    const arr = s.messagesByThread[tid] || []
    return { messagesByThread: { ...s.messagesByThread, [tid]: [...arr, msg] } }
  }),
}))