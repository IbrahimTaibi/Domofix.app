import { httpRequest } from '@/shared/utils/http'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { Review, Comment } from '@domofix/shared-types'

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
export interface ReviewsListResponse {
  data: Review[]
  total: number
  page: number
  limit: number
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  recentReviewsCount: number
}

export interface ReviewWithCustomer extends Review {
  customer?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export interface ListReviewsParams {
  providerId?: string
  serviceId?: string
  customerId?: string
  bookingId?: string
  page?: number
  limit?: number
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCommentData {
  content: string
  parentCommentId?: string
}

export interface CommentsListResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
}

// API Functions

/**
 * Get provider review statistics
 */
export async function getProviderStats(providerId?: string): Promise<ReviewStats> {
  const url = providerId
    ? `${API_BASE_URL}/reviews/stats?providerId=${providerId}`
    : `${API_BASE_URL}/reviews/stats`

  return httpRequest(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
}

/**
 * List reviews with filters
 */
export async function listReviews(params: ListReviewsParams = {}): Promise<ReviewsListResponse> {
  const queryParams = new URLSearchParams()

  if (params.providerId) queryParams.append('providerId', params.providerId)
  if (params.serviceId) queryParams.append('serviceId', params.serviceId)
  if (params.customerId) queryParams.append('customerId', params.customerId)
  if (params.bookingId) queryParams.append('bookingId', params.bookingId)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const url = `${API_BASE_URL}/reviews?${queryParams.toString()}`

  return httpRequest(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
}

/**
 * Get a single review by ID
 */
export async function getReview(reviewId: string): Promise<Review> {
  const url = `${API_BASE_URL}/reviews/${reviewId}`

  return httpRequest(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
}

/**
 * Add a comment to a review (provider can reply)
 */
export async function addComment(
  reviewId: string,
  data: CreateCommentData
): Promise<Comment> {
  const url = `${API_BASE_URL}/reviews/${reviewId}/comments`

  return httpRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  })
}

/**
 * List comments for a review
 */
export async function listComments(
  reviewId: string,
  page: number = 1,
  limit: number = 20
): Promise<CommentsListResponse> {
  const url = `${API_BASE_URL}/reviews/${reviewId}/comments?page=${page}&limit=${limit}`

  return httpRequest(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
}

/**
 * Get my reviews as a provider
 */
export async function getMyReviews(params: Omit<ListReviewsParams, 'providerId'> = {}): Promise<ReviewsListResponse> {
  // The backend will automatically use the authenticated user's ID as providerId
  return listReviews(params)
}
