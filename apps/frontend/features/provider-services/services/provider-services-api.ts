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

// Types
export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  RANGE = 'range',
  NEGOTIABLE = 'negotiable',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export interface ProviderService {
  _id: string
  providerId: string
  title: string
  description: string
  category: string
  pricingType: PricingType
  basePrice?: number
  minPrice?: number
  maxPrice?: number
  tags: string[]
  images: string[]
  status: ServiceStatus
  viewCount: number
  inquiryCount: number
  metadata?: Record<string, any>
  priceDisplay?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProviderServiceDto {
  title: string
  description: string
  category: string
  pricingType: PricingType
  basePrice?: number
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  images?: string[]
  status?: ServiceStatus
  metadata?: Record<string, any>
}

export interface UpdateProviderServiceDto {
  title?: string
  description?: string
  category?: string
  pricingType?: PricingType
  basePrice?: number
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  images?: string[]
  status?: ServiceStatus
  metadata?: Record<string, any>
}

export interface QueryServicesParams {
  category?: string
  status?: ServiceStatus
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedServicesResponse {
  data: ProviderService[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProviderStats {
  total: number
  byStatus: Record<string, {
    count: number
    totalViews: number
    totalInquiries: number
  }>
}

// API Functions

export async function createProviderService(
  dto: CreateProviderServiceDto,
): Promise<ProviderService> {
  return httpRequest<ProviderService>(`${API_BASE_URL}/provider-services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(dto),
  })
}

export async function getMyServices(
  params: QueryServicesParams = {},
): Promise<PaginatedServicesResponse> {
  const q = new URLSearchParams()
  if (params.category) q.set('category', params.category)
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)

  const url = `${API_BASE_URL}/provider-services/my-services${
    q.toString() ? `?${q.toString()}` : ''
  }`

  return httpRequest<PaginatedServicesResponse>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
}

export async function getMyStats(): Promise<ProviderStats> {
  return httpRequest<ProviderStats>(`${API_BASE_URL}/provider-services/my-stats`, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  })
}

export async function getServiceById(id: string): Promise<ProviderService> {
  return httpRequest<ProviderService>(
    `${API_BASE_URL}/provider-services/${encodeURIComponent(id)}`,
    {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    },
  )
}

export async function getServicesByCategory(
  category: string,
  params: QueryServicesParams = {},
): Promise<PaginatedServicesResponse> {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)

  const url = `${API_BASE_URL}/provider-services/category/${encodeURIComponent(
    category,
  )}${q.toString() ? `?${q.toString()}` : ''}`

  return httpRequest<PaginatedServicesResponse>(url, {
    method: 'GET',
  })
}

export async function updateProviderService(
  id: string,
  dto: UpdateProviderServiceDto,
): Promise<ProviderService> {
  return httpRequest<ProviderService>(
    `${API_BASE_URL}/provider-services/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(dto),
    },
  )
}

export async function updateServiceStatus(
  id: string,
  status: ServiceStatus,
): Promise<ProviderService> {
  return httpRequest<ProviderService>(
    `${API_BASE_URL}/provider-services/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    },
  )
}

export async function deleteProviderService(id: string): Promise<void> {
  await httpRequest<void>(
    `${API_BASE_URL}/provider-services/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    },
  )
}

export async function incrementInquiryCount(id: string): Promise<void> {
  await httpRequest<void>(
    `${API_BASE_URL}/provider-services/${encodeURIComponent(id)}/inquire`,
    {
      method: 'POST',
    },
  )
}

// Helper for category options (same as requests)
export const categoryOptions = [
  { value: 'plumber', label: 'Plombier' },
  { value: 'electrician', label: 'Électricien' },
  { value: 'cleaner', label: 'Agent d\'entretien' },
  { value: 'carpenter', label: 'Menuisier' },
  { value: 'painter', label: 'Peintre' },
  { value: 'gardener', label: 'Jardinier' },
  { value: 'barber', label: 'Coiffeur/Barbier' },
  { value: 'delivery', label: 'Livraison' },
  { value: 'tutor', label: 'Tuteur' },
  { value: 'other', label: 'Autre' },
]

// Helper for pricing type options
export const pricingTypeOptions = [
  { value: PricingType.FIXED, label: 'Prix fixe' },
  { value: PricingType.HOURLY, label: 'Tarif horaire' },
  { value: PricingType.RANGE, label: 'Fourchette de prix' },
  { value: PricingType.NEGOTIABLE, label: 'Négociable' },
]
