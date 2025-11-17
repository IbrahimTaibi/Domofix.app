/**
 * Widget-specific types and adapters
 * Provides clean separation between backend API types and widget UI types
 */

import type { ThreadSummary, ChatMessage } from '@darigo/shared-types'

/**
 * Widget participant - simplified view of a thread participant
 */
export interface WidgetParticipant {
  id: string
  name: string
  avatarUrl?: string
  role?: 'customer' | 'provider'
}

/**
 * Widget message - simplified message for chat UI
 */
export interface WidgetMessage {
  id: string
  threadId: string
  senderId: string
  text: string
  imageUrl?: string
  createdAt: string
  status: 'sent' | 'delivered' | 'read'
}

/**
 * Widget thread - simplified thread for chat list
 */
export interface WidgetThread {
  id: string
  orderId: string
  title: string
  participantIds: string[]
  participants: WidgetParticipant[]
  status: 'open' | 'archived' | 'blocked'
  lastMessageAt: string | null
  unreadCount: number
  isReadOnly: boolean // Computed: true if order is completed/canceled
}

/**
 * Order status from backend
 */
export type OrderStatus = 'assigned' | 'in_progress' | 'completed' | 'canceled'

/**
 * Convert backend ThreadSummary to widget thread
 */
export function toWidgetThread(
  summary: ThreadSummary,
  currentUserId: string,
  orderStatus?: OrderStatus
): WidgetThread {
  const participants: WidgetParticipant[] = summary.participants.map((p) => ({
    id: p.userId,
    name: summary.participantMeta?.[p.userId]?.name || 'Utilisateur',
    avatarUrl: summary.participantMeta?.[p.userId]?.avatar,
    role: p.role,
  }))

  // Find the other participant to generate title
  const otherParticipant = participants.find((p) => p.id !== currentUserId)
  const title = otherParticipant?.name || 'Conversation'

  // Determine if thread is read-only based on order status
  const isReadOnly =
    summary.status === 'archived' ||
    summary.status === 'blocked' ||
    orderStatus === 'completed' ||
    orderStatus === 'canceled'

  return {
    id: summary.id,
    orderId: summary.orderId,
    title,
    participantIds: participants.map((p) => p.id),
    participants,
    status: summary.status,
    lastMessageAt: summary.lastMessageAt
      ? new Date(summary.lastMessageAt).toISOString()
      : null,
    unreadCount: summary.unreadCounts[currentUserId] || 0,
    isReadOnly,
  }
}

/**
 * Convert backend ChatMessage to widget message
 */
export function toWidgetMessage(message: ChatMessage): WidgetMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    senderId: message.senderId,
    text: message.text || '',
    imageUrl: message.imageUrl,
    createdAt: new Date(message.createdAt).toISOString(),
    status: message.status,
  }
}

/**
 * System message for thread creation
 */
export function createSystemMessage(
  threadId: string,
  requestDisplayId: string
): WidgetMessage {
  return {
    id: `system-${threadId}`,
    threadId,
    senderId: 'system',
    text: `Cette conversation est liée à la demande ${requestDisplayId}. Vous pouvez maintenant échanger avec le prestataire.`,
    createdAt: new Date().toISOString(),
    status: 'read',
  }
}
