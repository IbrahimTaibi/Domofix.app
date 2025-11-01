import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['customer', 'provider'], {
    required_error: 'User type is required',
  }),
})

// Service Schemas
export const createServiceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string(),
  price: z.number().positive('Price must be positive'),
  duration: z.number().positive('Duration must be positive'),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
})

// Booking Schemas
export const createBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  scheduledDate: z.string().date(),
  scheduledTime: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  notes: z.string().optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
})

// Review Schemas
export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').optional(),
})

// Search Schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  minRating: z.number().optional(),
  maxPrice: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
})

// Export types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type SearchInput = z.infer<typeof searchSchema>

