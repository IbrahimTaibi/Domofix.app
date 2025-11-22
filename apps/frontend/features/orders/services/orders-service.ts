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

export type OrderStatus = 'assigned' | 'in_progress' | 'pending_completion' | 'completed' | 'canceled'

export type Order = {
  _id: string
  status: OrderStatus
  acceptedAt: string
  startedAt?: string | null
  completionRequestedAt?: string | null
  completedAt?: string | null
  canceledAt?: string | null
  providerEts?: string | null
  createdAt: string
  updatedAt: string
  // These can be either IDs or populated objects
  requestId: string | {
    _id: string
    category: string
    details?: string
    phone: string
    address?: any
    location?: any
  }
  customerId: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  providerId: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  serviceId?: string | {
    _id: string
    title: string
    category: string
  } | null
}

export async function listMyOrders(params: { status?: string } = {}): Promise<Order[]> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  const url = `${API_BASE_URL}/orders${q.toString() ? `?${q.toString()}` : ''}`
  return httpRequest<Order[]>(url, { method: 'GET', headers: { ...getAuthHeaders() } })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const url = `${API_BASE_URL}/orders/${orderId}/status`
  return httpRequest<Order>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status })
  })
}

export async function getOrderById(orderId: string): Promise<Order> {
  const url = `${API_BASE_URL}/orders/${orderId}`
  return httpRequest<Order>(url, { method: 'GET', headers: { ...getAuthHeaders() } })
}

export async function approveOrderCompletion(orderId: string): Promise<Order> {
  const url = `${API_BASE_URL}/orders/${orderId}/complete`
  return httpRequest<Order>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({})
  })
}

export async function declineOrderCompletion(orderId: string): Promise<Order> {
  const url = `${API_BASE_URL}/orders/${orderId}/decline-completion`
  return httpRequest<Order>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({})
  })
}