import { NextRequest } from 'next/server'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { CSRFConfig } from '@/middleware'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CSRFToken {
  token: string
  timestamp: number
  userId?: string
  sessionId: string
}

interface CSRFValidationResult {
  valid: boolean
  error?: string
  shouldRefresh?: boolean
}

interface CSRFStore {
  [key: string]: CSRFToken
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'

// In-memory store (use Redis in production)
const csrfStore: CSRFStore = {}

// Cleanup expired tokens every hour
setInterval(() => {
  const now = Date.now()
  Object.keys(csrfStore).forEach(key => {
    if (csrfStore[key].timestamp + CSRF_TOKEN_EXPIRY < now) {
      delete csrfStore[key]
    }
  })
}, 60 * 60 * 1000)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateSecureToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

function generateSessionId(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userId = request.headers.get('x-auth-user-id') || 'anonymous'
  
  const sessionData = `${ip}:${userAgent}:${userId}:${Date.now()}`
  return createHash('sha256').update(sessionData).digest('hex').slice(0, 16)
}

function createTokenHash(token: string, sessionId: string): string {
  return createHash('sha256')
    .update(`${token}:${sessionId}:${CSRF_SECRET}`)
    .digest('hex')
}

function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CSRF_TOKEN_EXPIRY
}

function shouldRefreshToken(timestamp: number): boolean {
  const age = Date.now() - timestamp
  const refreshThreshold = CSRF_TOKEN_EXPIRY * 0.75 // Refresh when 75% expired
  return age > refreshThreshold
}

function extractTokenFromRequest(request: NextRequest, config: CSRFConfig): string | null {
  // Try header first
  const headerToken = request.headers.get(config.tokenHeader)
  if (headerToken) {
    return headerToken
  }

  // Try cookie
  const cookieToken = request.cookies.get(config.cookieName)?.value
  if (cookieToken) {
    return cookieToken
  }

  // Try form data for POST requests
  if (request.method === 'POST') {
    try {
      // Note: This is a simplified example. In practice, you'd need to handle
      // different content types (form-data, JSON, etc.)
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // For form submissions, the token might be in the body
        // This would require reading the body, which is complex in middleware
        // Usually handled in the API route itself
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return null
}

function isExemptFromCSRF(pathname: string, config: CSRFConfig): boolean {
  return config.excludeRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

function getDoubleSubmitToken(request: NextRequest): { cookieToken: string | null, headerToken: string | null } {
  const cookieToken = request.cookies.get('csrf-token')?.value || null
  const headerToken = request.headers.get('x-csrf-token') || null
  
  return { cookieToken, headerToken }
}

// ============================================================================
// CSRF PROTECTION STRATEGIES
// ============================================================================

class SynchronizerTokenPattern {
  generateToken(request: NextRequest): CSRFToken {
    const token = generateSecureToken()
    const sessionId = generateSessionId(request)
    const userId = request.headers.get('x-auth-user-id') || undefined
    
    const csrfToken: CSRFToken = {
      token,
      timestamp: Date.now(),
      userId,
      sessionId
    }

    // Store token
    const tokenKey = createTokenHash(token, sessionId)
    csrfStore[tokenKey] = csrfToken

    return csrfToken
  }

  validateToken(request: NextRequest, providedToken: string): CSRFValidationResult {
    const sessionId = generateSessionId(request)
    const tokenKey = createTokenHash(providedToken, sessionId)
    const storedToken = csrfStore[tokenKey]

    if (!storedToken) {
      return { valid: false, error: 'CSRF token not found or invalid' }
    }

    if (isTokenExpired(storedToken.timestamp)) {
      delete csrfStore[tokenKey]
      return { valid: false, error: 'CSRF token expired' }
    }

    // Validate user context if available
    const currentUserId = request.headers.get('x-auth-user-id')
    if (storedToken.userId && currentUserId && storedToken.userId !== currentUserId) {
      return { valid: false, error: 'CSRF token user mismatch' }
    }

    const shouldRefresh = shouldRefreshToken(storedToken.timestamp)
    
    return { valid: true, shouldRefresh }
  }
}

class DoubleSubmitCookiePattern {
  generateToken(): string {
    return generateSecureToken()
  }

  validateToken(request: NextRequest): CSRFValidationResult {
    const { cookieToken, headerToken } = getDoubleSubmitToken(request)

    if (!cookieToken || !headerToken) {
      return { 
        valid: false, 
        error: 'Missing CSRF token in cookie or header' 
      }
    }

    // Use timing-safe comparison to prevent timing attacks
    try {
      const cookieBuffer = Buffer.from(cookieToken, 'hex')
      const headerBuffer = Buffer.from(headerToken, 'hex')

      if (cookieBuffer.length !== headerBuffer.length) {
        return { valid: false, error: 'CSRF token length mismatch' }
      }

      const isValid = timingSafeEqual(cookieBuffer, headerBuffer)
      
      if (!isValid) {
        return { valid: false, error: 'CSRF token mismatch' }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'CSRF token validation error' }
    }
  }
}

class OriginHeaderValidation {
  validateOrigin(request: NextRequest): CSRFValidationResult {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')

    // For same-origin requests, origin header should match host
    if (origin) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return { 
          valid: false, 
          error: `Origin mismatch: ${originHost} !== ${host}` 
        }
      }
    } else if (referer) {
      // Fallback to referer if origin is not present
      const refererHost = new URL(referer).host
      if (refererHost !== host) {
        return { 
          valid: false, 
          error: `Referer mismatch: ${refererHost} !== ${host}` 
        }
      }
    } else {
      // No origin or referer header (suspicious)
      return { 
        valid: false, 
        error: 'Missing origin and referer headers' 
      }
    }

    return { valid: true }
  }
}

// ============================================================================
// MAIN CSRF PROTECTION CLASS
// ============================================================================

class CSRFProtection {
  private synchronizerToken = new SynchronizerTokenPattern()
  private doubleSubmitCookie = new DoubleSubmitCookiePattern()
  private originValidation = new OriginHeaderValidation()

  async verify(request: NextRequest, config: CSRFConfig): Promise<CSRFValidationResult> {
    try {
      const pathname = request.nextUrl.pathname

      // Skip CSRF protection for exempt routes
      if (isExemptFromCSRF(pathname, config)) {
        return { valid: true }
      }

      // Skip for safe HTTP methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return { valid: true }
      }

      // Always validate origin for state-changing requests
      const originResult = this.originValidation.validateOrigin(request)
      if (!originResult.valid) {
        return originResult
      }

      // Extract CSRF token from request
      const providedToken = extractTokenFromRequest(request, config)
      if (!providedToken) {
        return { 
          valid: false, 
          error: 'CSRF token missing from request' 
        }
      }

      // Use double-submit cookie pattern as primary method
      const doubleSubmitResult = this.doubleSubmitCookie.validateToken(request)
      if (doubleSubmitResult.valid) {
        return doubleSubmitResult
      }

      // Fallback to synchronizer token pattern
      const synchronizerResult = this.synchronizerToken.validateToken(request, providedToken)
      return synchronizerResult

    } catch (error) {
      console.error('CSRF validation error:', error)
      return { 
        valid: false, 
        error: 'CSRF validation failed due to internal error' 
      }
    }
  }

  generateToken(request: NextRequest): { token: string, cookieOptions: any } {
    const token = this.doubleSubmitCookie.generateToken()
    
    const cookieOptions = {
      httpOnly: false, // Must be accessible to JavaScript for header submission
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds
      path: '/'
    }

    return { token, cookieOptions }
  }

  // Generate synchronizer token for forms
  generateSynchronizerToken(request: NextRequest): CSRFToken {
    return this.synchronizerToken.generateToken(request)
  }

  // Utility method to create CSRF meta tags for HTML pages
  generateMetaTags(token: string): string {
    return `<meta name="csrf-token" content="${token}">`
  }

  // Utility method to create hidden form fields
  generateFormField(token: string): string {
    return `<input type="hidden" name="_csrf" value="${token}">`
  }

  // Get CSRF statistics for monitoring
  getStats(): {
    totalTokens: number
    expiredTokens: number
    memoryUsage: string
  } {
    const now = Date.now()
    const totalTokens = Object.keys(csrfStore).length
    let expiredTokens = 0

    Object.values(csrfStore).forEach(token => {
      if (isTokenExpired(token.timestamp)) {
        expiredTokens++
      }
    })

    const memoryUsage = `${Math.round(JSON.stringify(csrfStore).length / 1024)} KB`

    return {
      totalTokens,
      expiredTokens,
      memoryUsage
    }
  }

  // Clean up expired tokens manually
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    Object.keys(csrfStore).forEach(key => {
      if (isTokenExpired(csrfStore[key].timestamp)) {
        delete csrfStore[key]
        cleaned++
      }
    })

    return cleaned
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const csrfProtection = new CSRFProtection()
export { CSRFProtection }
export type { CSRFToken, CSRFValidationResult, CSRFConfig }