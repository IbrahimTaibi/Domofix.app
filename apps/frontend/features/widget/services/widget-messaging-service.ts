/**
 * Widget Messaging Service
 * Handles all API calls and real-time socket communication for the widget
 * Clean separation of concerns from UI state management
 */

import { httpRequest } from '@/shared/utils/http'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { ThreadSummary, ChatMessage } from '@domofix/shared-types'
import type { OrderStatus } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Get authentication headers for API requests
 */
function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const lsToken = localStorage.getItem('auth_token')
    const storeToken = useAuthStore.getState().backendToken
    const token = lsToken || storeToken || null
    if (token) return { Authorization: `Bearer ${token}` }
  }
  return {}
}

/**
 * List all threads for the current user
 */
export async function listThreads(): Promise<ThreadSummary[]> {
  try {
    const res = await httpRequest<{
      data: ThreadSummary[]
      total: number
      page: number
      limit: number
    }>(`${API_BASE_URL}/threads`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    })
    return Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    console.error('[WidgetMessaging] Failed to list threads:', error)
    return []
  }
}

/**
 * List messages for a specific thread
 */
export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const res = await httpRequest<{
      data: ChatMessage[]
      nextCursor: string | null
    }>(
      `${API_BASE_URL}/threads/${encodeURIComponent(threadId)}/messages`,
      {
        method: 'GET',
        headers: { ...getAuthHeaders() },
      }
    )
    return Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    console.error(
      `[WidgetMessaging] Failed to list messages for thread ${threadId}:`,
      error
    )
    return []
  }
}

/**
 * Send a text message to a thread
 */
export async function sendMessage(
  threadId: string,
  text: string
): Promise<ChatMessage | null> {
  try {
    return await httpRequest<ChatMessage>(
      `${API_BASE_URL}/threads/${encodeURIComponent(threadId)}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ kind: 'text', text }),
      }
    )
  } catch (error) {
    console.error(
      `[WidgetMessaging] Failed to send message to thread ${threadId}:`,
      error
    )
    return null
  }
}

/**
 * Mark thread as read
 */
export async function markThreadAsRead(threadId: string): Promise<void> {
  try {
    await httpRequest<void>(
      `${API_BASE_URL}/threads/${encodeURIComponent(threadId)}/read`,
      {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      }
    )
  } catch (error) {
    console.error(
      `[WidgetMessaging] Failed to mark thread ${threadId} as read:`,
      error
    )
  }
}

/**
 * Get order status for a thread (to determine if read-only)
 * Note: This would ideally come from ThreadSummary.orderStatus in the future
 * For now, we'll need to fetch it separately or add it to the thread summary
 */
export async function getOrderStatus(
  orderId: string
): Promise<OrderStatus | null> {
  try {
    const res = await httpRequest<{ status: OrderStatus }>(
      `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'GET',
        headers: { ...getAuthHeaders() },
      }
    )
    return res?.status || null
  } catch (error) {
    console.error(
      `[WidgetMessaging] Failed to get order status for ${orderId}:`,
      error
    )
    return null
  }
}
