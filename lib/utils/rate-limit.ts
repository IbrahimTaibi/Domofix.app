import { NextRequest } from 'next/server'
import { RateLimitConfig } from '@/middleware'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  totalRequests: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

// ============================================================================
// IN-MEMORY RATE LIMIT STORE
// ============================================================================

// In production, you should use Redis or another distributed cache
const rateLimitStore: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getClientIdentifier(request: NextRequest): string {
  // Try to get the real IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  
  // For authenticated requests, you might want to use user ID instead
  const userId = request.headers.get('x-auth-user-id')
  
  // Create a composite key for better rate limiting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const route = request.nextUrl.pathname
  
  // Use different strategies based on route sensitivity
  if (route.includes('/api/auth/')) {
    // More strict for auth endpoints - use IP + User Agent
    return `auth:${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 10)}`
  } else if (userId) {
    // For authenticated requests, use user ID
    return `user:${userId}`
  } else {
    // For general requests, use IP
    return `ip:${ip}`
  }
}

function isExemptRoute(pathname: string): boolean {
  const exemptRoutes = [
    '/api/health',
    '/_next/',
    '/favicon.ico',
    '/assets/',
    '/uploads/'
  ]
  
  return exemptRoutes.some(route => pathname.startsWith(route))
}

function getRouteSpecificConfig(pathname: string, baseConfig: RateLimitConfig): RateLimitConfig {
  // Different rate limits for different types of endpoints
  const routeConfigs: Record<string, Partial<RateLimitConfig>> = {
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Very strict for login attempts
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // Very strict for registration
    },
    '/api/auth/': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // Strict for all auth endpoints
    },
    '/api/profile/': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 30, // Moderate for profile operations
    },
    '/api/': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // Default for API endpoints
    }
  }

  // Find the most specific matching route config
  let matchedConfig = baseConfig
  let longestMatch = 0

  for (const [route, config] of Object.entries(routeConfigs)) {
    if (pathname.startsWith(route) && route.length > longestMatch) {
      matchedConfig = { ...baseConfig, ...config }
      longestMatch = route.length
    }
  }

  return matchedConfig
}

// ============================================================================
// ADVANCED RATE LIMITING STRATEGIES
// ============================================================================

class SlidingWindowRateLimit {
  private store: Map<string, Array<{ timestamp: number; weight: number }>> = new Map()

  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get or create request history for this key
    let requests = this.store.get(key) || []
    
    // Remove old requests outside the window
    requests = requests.filter(req => req.timestamp > windowStart)
    
    // Calculate total weight (for weighted requests)
    const totalWeight = requests.reduce((sum, req) => sum + req.weight, 0)
    
    // Check if limit exceeded
    const success = totalWeight < config.maxRequests
    
    if (success) {
      // Add current request
      requests.push({ timestamp: now, weight: 1 })
      this.store.set(key, requests)
    }
    
    return {
      success,
      remaining: Math.max(0, config.maxRequests - totalWeight - (success ? 1 : 0)),
      resetTime: windowStart + config.windowMs,
      totalRequests: requests.length
    }
  }

  // Cleanup old entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, requests] of this.store.entries()) {
      const validRequests = requests.filter(req => req.timestamp > now - 24 * 60 * 60 * 1000) // Keep 24h
      if (validRequests.length === 0) {
        this.store.delete(key)
      } else {
        this.store.set(key, validRequests)
      }
    }
  }
}

class TokenBucketRateLimit {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map()

  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const bucket = this.buckets.get(key) || { 
      tokens: config.maxRequests, 
      lastRefill: now 
    }

    // Calculate tokens to add based on time passed
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor(timePassed / config.windowMs * config.maxRequests)
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }

    const success = bucket.tokens > 0
    
    if (success) {
      bucket.tokens--
    }

    this.buckets.set(key, bucket)

    return {
      success,
      remaining: bucket.tokens,
      resetTime: bucket.lastRefill + config.windowMs,
      totalRequests: config.maxRequests - bucket.tokens
    }
  }
}

// ============================================================================
// MAIN RATE LIMIT FUNCTION
// ============================================================================

const slidingWindow = new SlidingWindowRateLimit()
const tokenBucket = new TokenBucketRateLimit()

// Cleanup every 10 minutes
setInterval(() => {
  slidingWindow.cleanup()
}, 10 * 60 * 1000)

export async function rateLimit(
  request: NextRequest,
  baseConfig: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const pathname = request.nextUrl.pathname

    // Skip rate limiting for exempt routes
    if (isExemptRoute(pathname)) {
      return {
        success: true,
        remaining: baseConfig.maxRequests,
        resetTime: Date.now() + baseConfig.windowMs,
        totalRequests: 0
      }
    }

    // Get route-specific configuration
    const config = getRouteSpecificConfig(pathname, baseConfig)
    
    // Get client identifier
    const clientId = getClientIdentifier(request)
    
    // Use different rate limiting strategies based on the endpoint
    let result: RateLimitResult

    if (pathname.includes('/api/auth/')) {
      // Use token bucket for auth endpoints (more forgiving for legitimate users)
      result = tokenBucket.check(clientId, config)
    } else {
      // Use sliding window for general endpoints
      result = slidingWindow.check(clientId, config)
    }

    // Enhanced logging for rate limit violations
    if (!result.success) {
      console.warn(`Rate limit exceeded for ${clientId} on ${pathname}:`, {
        remaining: result.remaining,
        totalRequests: result.totalRequests,
        resetTime: new Date(result.resetTime).toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.ip
      })
    }

    return result

  } catch (error) {
    console.error('Rate limiting error:', error)
    
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      remaining: baseConfig.maxRequests,
      resetTime: Date.now() + baseConfig.windowMs,
      totalRequests: 0
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR MONITORING
// ============================================================================

export function getRateLimitStats(): {
  totalKeys: number
  memoryUsage: string
  topClients: Array<{ key: string; requests: number }>
} {
  const totalKeys = Object.keys(rateLimitStore).length
  const memoryUsage = `${Math.round(JSON.stringify(rateLimitStore).length / 1024)} KB`
  
  // Get top clients by request count
  const topClients = Object.entries(rateLimitStore)
    .map(([key, entry]) => ({ key, requests: entry.count }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10)

  return {
    totalKeys,
    memoryUsage,
    topClients
  }
}

export function clearRateLimitForClient(clientId: string): boolean {
  if (rateLimitStore[clientId]) {
    delete rateLimitStore[clientId]
    return true
  }
  return false
}

export function setCustomRateLimit(
  clientId: string,
  config: RateLimitConfig
): void {
  const now = Date.now()
  rateLimitStore[clientId] = {
    count: 0,
    resetTime: now + config.windowMs,
    firstRequest: now
  }
}

// ============================================================================
// REDIS IMPLEMENTATION (for production use)
// ============================================================================

/*
// Example Redis implementation for production use
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function rateLimitWithRedis(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const clientId = getClientIdentifier(request)
  const key = `rate_limit:${clientId}`
  const now = Date.now()
  const window = Math.floor(now / config.windowMs)
  const windowKey = `${key}:${window}`

  try {
    const pipeline = redis.pipeline()
    pipeline.incr(windowKey)
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000))
    
    const results = await pipeline.exec()
    const count = results?.[0]?.[1] as number || 0

    return {
      success: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime: (window + 1) * config.windowMs,
      totalRequests: count
    }
  } catch (error) {
    console.error('Redis rate limiting error:', error)
    // Fail open
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      totalRequests: 0
    }
  }
}
*/

// ============================================================================
// EXPORTS
// ============================================================================

export { SlidingWindowRateLimit, TokenBucketRateLimit }
export type { RateLimitResult, RateLimitEntry }