/**
 * Widget Messages Store
 * Manages messaging state for the widget with real backend integration
 */

"use client"

import { create } from 'zustand'
import type { ChatMessage } from '@domofix/shared-types'
import type { WidgetThread, WidgetMessage } from '../types'
import { toWidgetThread, toWidgetMessage, createSystemMessage } from '../types'
import * as widgetMessagingService from '../services/widget-messaging-service'

// Constants for thread polling
const THREAD_POLL_MAX_ATTEMPTS = 5
const THREAD_POLL_DELAY_MS = 500

// Cache sound module import (lazy loaded, shared across all messages)
let soundModulePromise: Promise<typeof import('@/shared/utils/sound')> | null = null
function getSoundModule() {
  if (typeof window === 'undefined') return null
  if (!soundModulePromise) {
    soundModulePromise = import('@/shared/utils/sound')
      .catch((err) => {
        // Clear cache on error so next call can retry
        soundModulePromise = null
        throw err
      })
  }
  return soundModulePromise
}

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

    set((state) => {
      // Add message to thread
      const existingMessages = state.messagesByThread[threadId] || []
      const messageExists = existingMessages.some((m) => m.id === message.id)

      if (messageExists) {
        return state
      }

      // Determine if this message is from the current user
      const isFromMe = normalizedCurrentUserId && normalizedCurrentUserId === normalizedSenderId

      // Play notification sound if message is not from current user
      // Note: We play sound even if thread is active, because the user might not be focused
      if (!isFromMe) {
        getSoundModule()
          ?.then(({ playNotificationAudioFile }) => {
            playNotificationAudioFile()
          })
          .catch((err) => {
            console.error('[MessagesStore] Failed to play notification sound:', err)
          })
      }

      const shouldIncrementUnread = threadId !== state.activeThreadId && !isFromMe

      return {
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: [...existingMessages, widgetMessage],
        },
        // Update unread count if not active thread and not from current user
        threads: state.threads.map((t) =>
          t.id === threadId && shouldIncrementUnread
            ? { ...t, unreadCount: t.unreadCount + 1 }
            : t
        ),
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
    // Poll for thread creation
    let thread: WidgetThread | undefined
    for (let attempt = 0; attempt < THREAD_POLL_MAX_ATTEMPTS; attempt++) {
      await get().loadThreads(currentUserId)
      const { threads } = get()
      thread = threads.find((t) => t.orderId === orderId)

      if (thread) break

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, THREAD_POLL_DELAY_MS))
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
