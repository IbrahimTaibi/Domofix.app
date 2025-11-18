/**
 * Widget Messages Store
 * Manages messaging state for the widget with real backend integration
 */

"use client"

import { create } from 'zustand'
import type { ChatMessage } from '@darigo/shared-types'
import type { WidgetThread, WidgetMessage } from '../types'
import { toWidgetThread, toWidgetMessage, createSystemMessage } from '../types'
import * as widgetMessagingService from '../services/widget-messaging-service'

interface MessagesState {
  // Data
  threads: WidgetThread[]
  messagesByThread: Record<string, WidgetMessage[]>
  activeThreadId: string | null

  // Loading states
  isLoadingThreads: boolean
  isLoadingMessages: Record<string, boolean>
  isSending: boolean

  // Error states
  error: string | null

  // Actions
  loadThreads: (currentUserId: string) => Promise<void>
  loadMessages: (threadId: string) => Promise<void>
  setActiveThread: (threadId: string, currentUserId: string) => Promise<void>
  backToList: () => void
  sendMessage: (text: string) => Promise<boolean>
  addIncomingMessage: (payload: { threadId: string; message: ChatMessage }, currentUserId: string | null) => void
  markAsRead: (payload: { threadId: string; userId: string }) => void

  // Auto-open functionality
  openThreadForOrder: (
    orderId: string,
    requestDisplayId: string,
    currentUserId: string
  ) => Promise<void>

  // Clear state (on logout)
  clear: () => void
}

const initialState = {
  threads: [],
  messagesByThread: {},
  activeThreadId: null,
  isLoadingThreads: false,
  isLoadingMessages: {},
  isSending: false,
  error: null,
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  ...initialState,

  /**
   * Load all threads for the current user
   */
  loadThreads: async (currentUserId: string) => {
    set({ isLoadingThreads: true, error: null })
    try {
      const threadSummaries = await widgetMessagingService.listThreads()

      // Convert to widget threads
      const threads = threadSummaries.map((summary) =>
        toWidgetThread(summary, currentUserId)
      )

      set({ threads, isLoadingThreads: false })
    } catch (error) {
      console.error('[MessagesStore] Failed to load threads:', error)
      set({
        error: 'Impossible de charger les conversations',
        isLoadingThreads: false,
      })
    }
  },

  /**
   * Load messages for a specific thread
   */
  loadMessages: async (threadId: string) => {
    set((state) => ({
      isLoadingMessages: { ...state.isLoadingMessages, [threadId]: true },
      error: null,
    }))

    try {
      const messages = await widgetMessagingService.listMessages(threadId)
      const widgetMessages = messages.map(toWidgetMessage)

      set((state) => ({
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: widgetMessages,
        },
        isLoadingMessages: { ...state.isLoadingMessages, [threadId]: false },
      }))
    } catch (error) {
      console.error(
        `[MessagesStore] Failed to load messages for thread ${threadId}:`,
        error
      )
      set((state) => ({
        error: 'Impossible de charger les messages',
        isLoadingMessages: { ...state.isLoadingMessages, [threadId]: false },
      }))
    }
  },

  /**
   * Set active thread and load its messages
   */
  setActiveThread: async (threadId: string, currentUserId: string) => {
    set({ activeThreadId: threadId })

    // Load messages if not already loaded
    const { messagesByThread } = get()
    if (!messagesByThread[threadId]) {
      await get().loadMessages(threadId)
    }

    // Mark as read
    await widgetMessagingService.markThreadAsRead(threadId)

    // Update unread count locally
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      ),
    }))
  },

  /**
   * Go back to thread list
   */
  backToList: () => {
    set({ activeThreadId: null })
  },

  /**
   * Send a message to the active thread
   */
  sendMessage: async (text: string) => {
    const { activeThreadId, threads } = get()
    if (!activeThreadId) return false

    // Check if thread is read-only
    const thread = threads.find((t) => t.id === activeThreadId)
    if (thread?.isReadOnly) {
      set({ error: 'Cette conversation est fermée' })
      return false
    }

    set({ isSending: true, error: null })

    try {
      const message = await widgetMessagingService.sendMessage(
        activeThreadId,
        text
      )

      if (message) {
        // Don't add message here - let Socket.IO handle it
        // This prevents duplicate messages in the sender's UI
        set({ isSending: false })
        return true
      } else {
        set({ error: "Échec de l'envoi du message", isSending: false })
        return false
      }
    } catch (error) {
      console.error('[MessagesStore] Failed to send message:', error)
      set({ error: "Échec de l'envoi du message", isSending: false })
      return false
    }
  },

  /**
   * Add incoming message from Socket.IO
   */
  addIncomingMessage: (payload: {
    threadId: string
    message: ChatMessage
  }, currentUserId: string | null) => {
    const { threadId, message } = payload
    const widgetMessage = toWidgetMessage(message)

    // Normalize IDs to strings for comparison
    const normalizedCurrentUserId = currentUserId ? String(currentUserId) : null
    const normalizedSenderId = message.senderId ? String(message.senderId) : null

    console.log('[MessagesStore] Incoming message:', {
      threadId,
      messageId: message.id,
      senderId: normalizedSenderId,
      currentUserId: normalizedCurrentUserId,
      isFromMe: normalizedCurrentUserId === normalizedSenderId,
    })

    set((state) => {
      // Add message to thread
      const existingMessages = state.messagesByThread[threadId] || []
      const messageExists = existingMessages.some((m) => m.id === message.id)

      if (messageExists) {
        console.log('[MessagesStore] Message already exists, skipping:', message.id)
        return state
      }

      // Determine if this message is from the current user
      const isFromMe = normalizedCurrentUserId && normalizedCurrentUserId === normalizedSenderId
      const isInActiveThread = threadId === state.activeThreadId

      console.log('[MessagesStore] Notification check:', {
        isFromMe,
        isInActiveThread,
        activeThreadId: state.activeThreadId,
        shouldNotify: !isFromMe && !isInActiveThread,
        windowDefined: typeof window !== 'undefined',
      })

      // Play notification sound only if message is not from current user AND thread is not active
      // This prevents annoying sounds during active conversations
      if (!isFromMe && !isInActiveThread) {
        console.log('[MessagesStore] 🔊 TRIGGERING NOTIFICATION SOUND for message from:', normalizedSenderId)
        if (typeof window !== 'undefined') {
          console.log('[MessagesStore] Window is defined, importing sound module...')
          import('@/shared/utils/sound').then(({ playNotificationAudioFile }) => {
            console.log('[MessagesStore] Sound module loaded, calling playNotificationAudioFile()')
            playNotificationAudioFile()
            console.log('[MessagesStore] playNotificationAudioFile() called successfully')
          }).catch((err) => {
            console.error('[MessagesStore] ❌ FAILED to import or play notification sound:', err)
          })
        } else {
          console.warn('[MessagesStore] ❌ Window is not defined, cannot play sound')
        }
      } else {
        console.log('[MessagesStore] 🔇 NOT playing sound - message is from current user or thread is active')
      }

      return {
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: [...existingMessages, widgetMessage],
        },
        // Update unread count if not active thread and not from current user
        threads: state.threads.map((t) => {
          if (t.id === threadId) {
            const shouldIncrement = threadId !== state.activeThreadId && !isFromMe
            console.log('[MessagesStore] Thread unread check:', {
              threadId: t.id,
              currentUnread: t.unreadCount,
              isActiveThread: threadId === state.activeThreadId,
              isFromMe,
              willIncrement: shouldIncrement,
            })
            if (shouldIncrement) {
              const newCount = t.unreadCount + 1
              console.log('[MessagesStore] 🔴 INCREMENTING unread count:', t.unreadCount, '→', newCount)
              return { ...t, unreadCount: newCount }
            }
          }
          return t
        }),
      }
    })
  },

  /**
   * Mark messages as read from Socket.IO event
   */
  markAsRead: (payload: { threadId: string; userId: string }) => {
    const { threadId } = payload
    // Update message status in the thread
    set((state) => ({
      messagesByThread: {
        ...state.messagesByThread,
        [threadId]: (state.messagesByThread[threadId] || []).map((msg) =>
          msg.status !== 'read' ? { ...msg, status: 'read' as const } : msg
        ),
      },
    }))
  },

  /**
   * Auto-open thread when customer accepts provider
   * Polls for thread creation (since it's async on backend)
   */
  openThreadForOrder: async (
    orderId: string,
    requestDisplayId: string,
    currentUserId: string
  ) => {
    // Poll for thread creation (max 5 attempts over 2.5 seconds)
    let thread: WidgetThread | undefined
    for (let attempt = 0; attempt < 5; attempt++) {
      await get().loadThreads(currentUserId)
      const { threads } = get()
      thread = threads.find((t) => t.orderId === orderId)

      if (thread) break

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (!thread) {
      console.error(
        `[MessagesStore] Thread for order ${orderId} not found after polling`
      )
      set({ error: 'Impossible de charger la conversation. Veuillez réessayer.' })
      return
    }

    // Open the thread
    set({ activeThreadId: thread.id })

    // Load messages
    await get().loadMessages(thread.id)

    // Check if we need to add a system message
    const messages = get().messagesByThread[thread.id] || []
    const hasSystemMessage = messages.some((m) => m.senderId === 'system')

    if (!hasSystemMessage) {
      // Add system message locally (it will be replaced when messages reload)
      const systemMsg = createSystemMessage(thread.id, requestDisplayId)
      set((state) => ({
        messagesByThread: {
          ...state.messagesByThread,
          [thread.id]: [systemMsg, ...messages],
        },
      }))
    }
  },

  /**
   * Clear all state (on logout)
   */
  clear: () => {
    set(initialState)
  },
}))
