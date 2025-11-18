/**
 * Widget Socket Hook
 * Manages Socket.IO connection for real-time widget updates
 */

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from '@darigo/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWidgetSocketOptions {
  enabled?: boolean
  onNewMessage?: (payload: { threadId: string; message: ChatMessage }) => void
  onMessageRead?: (payload: { threadId: string; userId: string }) => void
  onStatusChange?: (status: SocketStatus) => void
}

/**
 * Hook for managing Socket.IO connection in the widget
 */
export function useWidgetSocket(options: UseWidgetSocketOptions = {}) {
  const { enabled = true, onNewMessage, onMessageRead, onStatusChange } = options

  const socketRef = useRef<Socket | null>(null)
  const onNewMessageRef = useRef(onNewMessage)
  const onMessageReadRef = useRef(onMessageRead)
  const onStatusChangeRef = useRef(onStatusChange)
  const joinedThreadsRef = useRef<Set<string>>(new Set())

  // Update refs when callbacks change
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  useEffect(() => {
    onMessageReadRef.current = onMessageRead
  }, [onMessageRead])

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) return

    const token = getToken()
    if (!token) {
      onStatusChangeRef.current?.('disconnected')
      return
    }

    try {
      onStatusChangeRef.current?.('connecting')

      const socket = io(`${API_BASE_URL}/messages`, {
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
      })

      socketRef.current = socket

      // Connection events
      socket.on('connect', () => {
        onStatusChangeRef.current?.('connected')

        // Re-join all previously joined threads on reconnection
        const threadsToRejoin = Array.from(joinedThreadsRef.current)
        if (threadsToRejoin.length > 0) {
          threadsToRejoin.forEach((threadId) => {
            socket.emit('thread:join', { threadId })
          })
        }
      })

      socket.on('connect_error', (error) => {
        console.error('[WidgetSocket] Connection error:', error)
        onStatusChangeRef.current?.('error')
      })

      socket.on('disconnect', () => {
        onStatusChangeRef.current?.('disconnected')
      })

      // Message events
      socket.on(
        'message:new',
        (payload: { threadId: string; message: ChatMessage }) => {
          onNewMessageRef.current?.(payload)
        }
      )

      socket.on(
        'message:read',
        (payload: { threadId: string; userId: string }) => {
          onMessageReadRef.current?.(payload)
        }
      )

      return () => {
        socket.disconnect()
        socketRef.current = null
      }
    } catch (error) {
      console.error('[WidgetSocket] Failed to initialize socket:', error)
      onStatusChangeRef.current?.('error')
    }
  }, [enabled])

  /**
   * Join a thread room to receive real-time updates
   */
  const joinThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('thread:join', { threadId })
    }
    // Track joined threads for reconnection
    joinedThreadsRef.current.add(threadId)
  }, [])

  /**
   * Leave a thread room
   */
  const leaveThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('thread:leave', { threadId })
    }
    joinedThreadsRef.current.delete(threadId)
  }, [])

  return {
    joinThread,
    leaveThread,
    socket: socketRef.current,
  }
}
