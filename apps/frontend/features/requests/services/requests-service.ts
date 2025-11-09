import { httpRequest } from '@/shared/utils/http'
import { ServiceCategory, CreateRequestRequest, ApplyForRequestRequest, AcceptProviderRequest, Request, RequestStatus } from '@darigo/shared-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function createRequest(payload: CreateRequestRequest): Promise<Request> {
  return httpRequest<Request>(`${API_BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
}

export async function applyForRequest(requestId: string, payload: ApplyForRequestRequest): Promise<Request> {
  return httpRequest<Request>(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
}

export async function acceptProvider(requestId: string, payload: AcceptProviderRequest): Promise<Request> {
  return httpRequest<Request>(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
}

export async function completeRequest(requestId: string): Promise<Request> {
  return httpRequest<Request>(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/complete`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders() },
  })
}

// Simple cache helpers for UX continuity
const LS_LAST_REQUEST_KEY = 'darigo_last_request'

export function cacheLastRequest(req: Request) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_LAST_REQUEST_KEY, JSON.stringify(req))
    }
  } catch {}
}

export function getCachedLastRequest(): Request | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LS_LAST_REQUEST_KEY)
      return raw ? (JSON.parse(raw) as Request) : null
    }
  } catch {}
  return null
}

// Helper for category options
export const categoryOptions: { value: ServiceCategory; label: string }[] = [
  { value: ServiceCategory.PLUMBER, label: 'Plombier' },
  { value: ServiceCategory.ELECTRICIAN, label: 'Électricien' },
  { value: ServiceCategory.CLEANER, label: 'Agent d’entretien' },
  { value: ServiceCategory.CARPENTER, label: 'Menuisier' },
  { value: ServiceCategory.PAINTER, label: 'Peintre' },
  { value: ServiceCategory.GARDENER, label: 'Jardinier' },
  { value: ServiceCategory.BARBER, label: 'Coiffeur/Barbier' },
  { value: ServiceCategory.DELIVERY, label: 'Livraison' },
  { value: ServiceCategory.TUTOR, label: 'Tuteur' },
  { value: ServiceCategory.OTHER, label: 'Autre' },
]

export async function uploadRequestPhotos(requestId: string, files: File[]): Promise<Request> {
  const form = new FormData();
  for (const f of files.slice(0, 5)) {
    form.append('photos', f);
  }
  return httpRequest<Request>(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}/photos`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: form,
  })
}

export interface ListRequestsParams {
  status?: RequestStatus
  offset?: number
  limit?: number
}

export async function listMyRequests(params: ListRequestsParams = {}): Promise<Request[]> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', String(params.status))
  if (typeof params.offset === 'number') q.set('offset', String(params.offset))
  if (typeof params.limit === 'number') q.set('limit', String(params.limit))
  const url = `${API_BASE_URL}/requests${q.toString() ? `?${q.toString()}` : ''}`
  return httpRequest<Request[]>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
}