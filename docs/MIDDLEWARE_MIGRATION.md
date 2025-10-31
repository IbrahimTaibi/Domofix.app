# Middleware Migration Documentation

## Overview

This document outlines the consolidation of middleware functionality from two separate files (`/middleware.ts` and `/types/middleware.ts`) into a single `/middleware.ts` file. The migration also includes replacing custom security implementations with established libraries.

## Changes Made

### 1. Type Consolidation

All type definitions previously in `/types/middleware.ts` have been moved to `/middleware.ts`:

- `RateLimitConfig`
- `CSRFConfig`
- `RefreshTokenConfig`
- `SecurityAuditLog`
- `UserRole`
- `MiddlewareConfig`
- `AuthContext`
- `MiddlewareError`

### 2. Security Library Integration

Custom security implementations have been replaced with established libraries:

- **Security Headers**: Replaced custom header implementation with `next-secure-headers`
  - Provides comprehensive Content Security Policy (CSP)
  - Implements all recommended security headers
  - Follows OWASP best practices

- **Rate Limiting**: Replaced custom rate limiting with `next-rate-limit`
  - More efficient implementation
  - Better handling of distributed environments
  - Improved performance

- **CSRF Protection**: Simplified CSRF protection
  - Basic origin checking in middleware
  - Full CSRF protection using `csurf` in API routes

### 3. Import Updates

All files that previously imported from `/types/middleware.ts` now import from `/middleware.ts`:

- `lib/utils/audit-logger.ts`
- `lib/utils/csrf-protection.ts`
- `lib/utils/rate-limit.ts`

## Configuration Changes

### Security Headers

The application now uses `next-secure-headers` with the following configuration:

```typescript
const headers = secureHeaders({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    }
  },
  frameGuard: "deny",
  noopen: true,
  nosniff: true,
  xssProtection: "block-rendering",
  forceHttps: true,
  referrerPolicy: "strict-origin-when-cross-origin"
});
```

### Rate Limiting

Rate limiting is now handled by `next-rate-limit` with the following configuration:

```typescript
const rateLimiter = new RateLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP address as the key
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown';
    return ip;
  }
});
```

## Testing

To verify the middleware functionality:

1. **Authentication**: Test accessing protected routes with and without valid tokens
2. **Role-based Access**: Test accessing role-specific routes with different user roles
3. **Rate Limiting**: Test making multiple requests in quick succession
4. **Security Headers**: Inspect response headers using browser developer tools

## Rollback Plan

If issues emerge with the consolidated middleware:

1. Restore the `/types/middleware.ts` file from version control
2. Revert import statements in dependent files
3. Revert the changes to `/middleware.ts`
4. Remove the installed security libraries if they're causing issues

## Future Improvements

- Implement more comprehensive testing for middleware functionality
- Consider using Redis for distributed rate limiting in production
- Enhance CSRF protection with double-submit cookie pattern
- Add monitoring and alerting for security events