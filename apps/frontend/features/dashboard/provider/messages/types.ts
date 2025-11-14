export interface ThreadSummary {
  id: string
  title: string
  avatarUrl: string
  lastMessage: string
  lastTime: string
  unreadCount: number
}

export type MessageKind = 'text' | 'image' | 'file'

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderAvatarUrl?: string | null
  kind: MessageKind
  text?: string
  imageUrl?: string
  file?: { name: string; size: number; url: string }
  createdAt: string
  status: 'sent' | 'delivered' | 'read'
}

export interface Participant {
  id: string
  name: string
  avatarUrl: string
  role: 'customer' | 'provider'
}
