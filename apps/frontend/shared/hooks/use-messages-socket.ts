"use client"

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from '@domofix/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

type Status = 'connecting' | 'open' | 'error' | 'closed'

export function useMessagesSocket(options?: {
  onStatusChange?: (s: Status) => void
  onNewMessage?: (payload: { threadId: string; message: ChatMessage }) => void
  onRead?: (payload: { threadId: string; userId: string }) => void
}) {
  const socketRef = useRef<Socket | null>(null)
  const statusCb = useRef(options?.onStatusChange || null)
  const newMsgCb = useRef(options?.onNewMessage || null)
  const readCb = useRef(options?.onRead || null)

  useEffect(() => { statusCb.current = options?.onStatusChange || null }, [options?.onStatusChange])
  useEffect(() => { newMsgCb.current = options?.onNewMessage || null }, [options?.onNewMessage])
  useEffect(() => { readCb.current = options?.onRead || null }, [options?.onRead])

  useEffect(() => {
    const token = getToken()
    if (!token) return
    try {
      statusCb.current?.('connecting')
      const socket = io(`${API_BASE_URL}/messages`, {
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
      })
      socketRef.current = socket
      socket.on('connect', () => statusCb.current?.('open'))
      socket.on('connect_error', () => statusCb.current?.('error'))
      socket.on('disconnect', () => statusCb.current?.('closed'))
      socket.on('status', (msg: any) => { const s = String(msg?.status || '') as Status; if (s) statusCb.current?.(s) })
      socket.on('message:new', (payload: { threadId: string; message: ChatMessage }) => { try { newMsgCb.current?.(payload) } catch {} })
      socket.on('message:read', (payload: { threadId: string; userId: string }) => { try { readCb.current?.(payload) } catch {} })
    } catch { statusCb.current?.('error') }
    return () => { try { socketRef.current?.disconnect() } catch {}; socketRef.current = null }
  }, [])

  const joinThread = useCallback((threadId: string) => { socketRef.current?.emit('thread:join', { threadId }) }, [])
  const leaveThread = useCallback((threadId: string) => { socketRef.current?.emit('thread:leave', { threadId }) }, [])

  return { joinThread, leaveThread }
}

