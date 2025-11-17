import { httpRequest } from '@/shared/utils/http'
import { useAuthStore } from '@/features/auth/store/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ProvidersForServiceResponse {
  request: { id: string; category?: string; status?: string; estimatedTimeOfService?: string }
  providers: Array<{
    id: string
    name: string
    title?: string
    avatar?: string | null
    bio?: string | null
    address?: { fullAddress?: string | null; city?: string | null; country?: string | null } | null
    timezone?: string | null
    locale?: string | null
    status?: string | null
    providerStatus?: string | null
    rating?: number
    reviewCount?: number
    completedCount?: number
    pricingRange?: { min: number; max: number } | null
    availability?: any | null
    specialties?: string[]
    proposedEts?: string | null
    proposedPrice?: number | null
    proposedPriceRange?: { min: number; max: number } | null
  }>
}

export async function fetchProvidersForService(serviceId: string): Promise<ProvidersForServiceResponse> {
  // Map serviceId → requestId on backend
  const url = `${API_BASE_URL}/requests/${encodeURIComponent(serviceId)}/providers`
  // Attach Authorization header from store or localStorage
  let authHeader: HeadersInit = {}
  if (typeof window !== 'undefined') {
    const lsToken = localStorage.getItem('auth_token')
    const storeToken = useAuthStore.getState().backendToken
    const token = lsToken || storeToken || null
    if (token) authHeader = { Authorization: `Bearer ${token}` }
  }
  return httpRequest<ProvidersForServiceResponse>(url, { method: 'GET', headers: { ...authHeader } })
}