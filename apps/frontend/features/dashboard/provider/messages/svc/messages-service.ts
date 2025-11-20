import { httpRequest } from '@/shared/utils/http'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { ThreadSummary, ChatMessage } from '@domofix/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const lsToken = localStorage.getItem('auth_token')
    const storeToken = useAuthStore.getState().backendToken
    const token = lsToken || storeToken || null
    if (token) return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function listThreads(): Promise<ThreadSummary[]> {
  const res = await httpRequest<{ data: ThreadSummary[]; total: number; page: number; limit: number }>(`${API_BASE_URL}/threads`, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
  return Array.isArray(res?.data) ? res.data : []
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const res = await httpRequest<{ data: ChatMessage[]; nextCursor: string | null }>(`${API_BASE_URL}/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
  return Array.isArray(res?.data) ? res.data : []
}

export async function sendMessage(threadId: string, payload: { kind: 'text'; text: string }): Promise<ChatMessage> {
  return httpRequest<ChatMessage>(`${API_BASE_URL}/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
}
