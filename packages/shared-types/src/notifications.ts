export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export type NotificationType =
  | 'request.created'
  | 'request.accepted'
  | 'request.completed'
  | 'provider.application.created'
  | 'provider.application.updated'
  | 'system.message'

export interface NotificationPayload {
  title: string
  message: string
  severity: NotificationSeverity
  type: NotificationType
  data?: Record<string, unknown>
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  severity: NotificationSeverity
  type: NotificationType
  data?: Record<string, unknown>
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ListNotificationsResponse {
  data: Notification[]
  nextCursor?: string | null
}

export interface MarkNotificationReadRequest {
  id: string
}