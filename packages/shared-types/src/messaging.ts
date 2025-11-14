export type MessageKind = 'text' | 'image' | 'file'

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  kind: MessageKind
  text?: string
  imageUrl?: string
  fileMeta?: { name: string; size: number; mime: string }
  status: 'sent' | 'delivered' | 'read'
  createdAt: string | Date
}

export interface ThreadParticipant {
  userId: string
  role: 'customer' | 'provider'
}

export interface ThreadSummary {
  id: string
  orderId: string
  participants: ThreadParticipant[]
  status: 'open' | 'archived' | 'blocked'
  lastMessageAt: string | Date | null
  unreadCounts: Record<string, number>
  participantMeta?: Record<string, { name: string; avatar?: string }>
}
