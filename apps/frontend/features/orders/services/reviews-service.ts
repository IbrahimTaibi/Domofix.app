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

export interface CreateReviewData {
  bookingId: string
  customerId: string
  providerId: string
  serviceId: string
  rating: number
  comment?: string
  images?: string[]
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  providerId: string
  serviceId: string
  rating: number
  comment?: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export async function createReview(data: CreateReviewData): Promise<any> {
  const url = `${API_BASE_URL}/reviews`
  return httpRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  })
}

export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const url = `${API_BASE_URL}/reviews?bookingId=${bookingId}`
  const response = await httpRequest<{ data: Review[]; total: number; page: number; limit: number }>(url, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  // Returns { data: [], total: 0, page: 1, limit: 20 }
  if (response.data && response.data.length > 0) {
    return response.data[0]
  }
  return null
}
