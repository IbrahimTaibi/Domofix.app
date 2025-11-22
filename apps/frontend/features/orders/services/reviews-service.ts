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

export async function createReview(data: CreateReviewData): Promise<any> {
  const url = `${API_BASE_URL}/reviews`
  return httpRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  })
}
