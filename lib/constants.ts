import { ServiceCategory } from '@/types'

export const APP_NAME = 'Tawa'
export const APP_DESCRIPTION = 'Your city\'s services platform'

// Service Categories with Icons and Colors
export const SERVICE_CATEGORIES = {
  [ServiceCategory.PLUMBER]: {
    label: 'Plumber',
    icon: '🔧',
    color: '#3b82f6',
  },
  [ServiceCategory.BARBER]: {
    label: 'Barber',
    icon: '💈',
    color: '#8b5cf6',
  },
  [ServiceCategory.CLEANER]: {
    label: 'Cleaner',
    icon: '🧹',
    color: '#10b981',
  },
  [ServiceCategory.TUTOR]: {
    label: 'Tutor',
    icon: '📚',
    color: '#f59e0b',
  },
  [ServiceCategory.DELIVERY]: {
    label: 'Delivery',
    icon: '🚚',
    color: '#ef4444',
  },
  [ServiceCategory.ELECTRICIAN]: {
    label: 'Electrician',
    icon: '⚡',
    color: '#fbbf24',
  },
  [ServiceCategory.CARPENTER]: {
    label: 'Carpenter',
    icon: '🔨',
    color: '#92400e',
  },
  [ServiceCategory.PAINTER]: {
    label: 'Painter',
    icon: '🎨',
    color: '#8b5cf6',
  },
  [ServiceCategory.GARDENER]: {
    label: 'Gardener',
    icon: '🌿',
    color: '#059669',
  },
  [ServiceCategory.OTHER]: {
    label: 'Other',
    icon: '📋',
    color: '#6b7280',
  },
}

// Booking Status Labels
export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: '#fbbf24' },
  confirmed: { label: 'Confirmed', color: '#10b981' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  completed: { label: 'Completed', color: '#059669' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
}

// Default values
export const DEFAULT_SEARCH_RADIUS = 10 // km
export const MIN_SEARCH_RADIUS = 1 // km
export const MAX_SEARCH_RADIUS = 50 // km

export const ITEMS_PER_PAGE = 20

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  SERVICE_SEARCH: '/services/search',
  
  // Providers
  PROVIDERS: '/providers',
  PROVIDER_BY_ID: (id: string) => `/providers/${id}`,
  
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEW_BY_ID: (id: string) => `/reviews/${id}`,
}

// Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_DESCRIPTION_LENGTH: 1000,
}

