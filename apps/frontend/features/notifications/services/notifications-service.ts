import { httpRequest } from '@/shared/utils/http'
import type { Notification, ListNotificationsResponse } from '@darigo/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function listNotifications(limit = 50, cursor?: string): Promise<ListNotificationsResponse> {
  const url = new URL(`${API_BASE_URL}/notifications`)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  return httpRequest<ListNotificationsResponse>(url.toString(), {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return httpRequest<Notification>(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders() },
  })
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return httpRequest<{ updated: number }>(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({}),
  })
}