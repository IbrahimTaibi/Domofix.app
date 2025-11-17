import { httpRequest } from '@/shared/utils/http'
import { useAuthStore } from '@/features/auth/store/auth-store'

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

export type Order = {
  id: string
  requestId: string
  customerId: string
  providerId: string
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
}

export async function listMyOrders(params: { status?: string } = {}): Promise<Order[]> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  const url = `${API_BASE_URL}/orders${q.toString() ? `?${q.toString()}` : ''}`
  return httpRequest<Order[]>(url, { method: 'GET', headers: { ...getAuthHeaders() } })
}