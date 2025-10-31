import { NextRequest, NextResponse } from "next/server";
import { verifyToken, decodeToken, JWTPayload, generateToken } from "@/lib/jwt";
import { auditLogger } from "@/lib/utils/audit-logger";
import rateLimit from "next-rate-limit";

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  strategy?: "sliding-window" | "token-bucket";
}

export interface CSRFConfig {
  enabled: boolean;
  tokenHeader: string;
  cookieName: string;
  excludeRoutes: string[];
}

export interface RefreshTokenConfig {
  enabled: boolean;
  refreshThreshold: number; // minutes before expiry to refresh
  maxRefreshAttempts: number;
}

export interface SecurityAuditLog {
  timestamp: Date;
  ip: string;
  userAgent: string;
  userId?: string;
  action: string;
  route: string;
  success: boolean;
  errorMessage?: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export type UserRole = "customer" | "provider" | "admin";

export interface MiddlewareConfig {
  publicRoutes: string[];
  protectedRoutes: string[];
  roleBasedRoutes: Record<string, UserRole[]>;
  rateLimit: RateLimitConfig;
  csrf: CSRFConfig;
  refreshToken: RefreshTokenConfig;
}

export interface AuthContext {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  token: string | null;
  refreshToken: string | null;
}

export interface MiddlewareError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: MiddlewareConfig = {
  publicRoutes: [
    "/",
    "/login",
    "/register",
    "/get-started",
    "/get-started/provider",
    "/get-started/customer",
    "/register/customer",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/me", // Allow checking auth status without middleware verification
    "/api/seed", // Add seeding endpoint to public routes
    "/api/health",
    "/_next",
    "/favicon.ico",
    "/assets",
    "/uploads",
  ],
  protectedRoutes: [
    "/profile",
    "/dashboard",
    "/bookings",
    "/api/profile",
    "/api/bookings",
  ],
  roleBasedRoutes: {
    "/admin": ["admin"],
    "/api/admin": ["admin"],
    "/provider/dashboard": ["provider", "admin"],
    "/api/provider": ["provider", "admin"],
    "/customer/bookings": ["customer", "admin"],
    "/api/customer": ["customer", "admin"],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    strategy: "sliding-window" as const,
  },
  csrf: {
    enabled: true,
    tokenHeader: "x-csrf-token",
    cookieName: "csrf-token",
    excludeRoutes: ["/api/auth/login", "/api/auth/register"],
  },
  refreshToken: {
    enabled: true,
    refreshThreshold: 30, // 30 minutes
    maxRefreshAttempts: 3,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isPublicRoute(pathname: string, publicRoutes: string[]): boolean {
  return publicRoutes.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isProtectedRoute(
  pathname: string,
  protectedRoutes: string[],
): boolean {
  return protectedRoutes.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function getRoleRequirements(
  pathname: string,
  roleBasedRoutes: Record<string, UserRole[]>,
): UserRole[] | null {
  for (const [route, roles] of Object.entries(roleBasedRoutes)) {
    if (route.endsWith("*")) {
      if (pathname.startsWith(route.slice(0, -1))) {
        return roles;
      }
    } else if (pathname === route || pathname.startsWith(route + "/")) {
      return roles;
    }
  }
  return null;
}

function extractToken(request: NextRequest): {
  token: string | null;
  source: "cookie" | "header" | null;
} {
  // Try cookie first (more secure)
  const cookieToken = request.cookies.get("auth-token")?.value;
  if (cookieToken) {
    return { token: cookieToken, source: "cookie" };
  }

  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return { token: authHeader.substring(7), source: "header" };
  }

  return { token: null, source: null };
}

function createAuthContext(
  payload: JWTPayload | null,
  token: string | null,
): AuthContext {
  return {
    user: payload,
    isAuthenticated: !!payload,
    hasRole: (role: UserRole) => payload?.role === role,
    hasAnyRole: (roles: UserRole[]) =>
      !!payload && roles.includes(payload.role),
    token,
    refreshToken: null, // Will be implemented with refresh token logic
  };
}

function createErrorResponse(error: MiddlewareError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { details: error.details }),
    },
    { status: error.statusCode },
  );
}

async function logSecurityEvent(
  request: NextRequest,
  action: string,
  success: boolean,
  userId?: string,
  errorMessage?: string,
  riskLevel: SecurityAuditLog["riskLevel"] = "low",
): Promise<void> {
  const log: SecurityAuditLog = {
    timestamp: new Date(),
    ip: request.ip || request.headers.get("x-forwarded-for") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    userId,
    action,
    route: request.nextUrl.pathname,
    success,
    errorMessage,
    riskLevel,
  };

  await auditLogger.log(log);
}

// ============================================================================
// TOKEN REFRESH LOGIC
// ============================================================================

async function handleTokenRefresh(
  request: NextRequest,
  payload: JWTPayload,
  config: RefreshTokenConfig,
): Promise<{ newToken?: string; shouldRefresh: boolean }> {
  if (!config.enabled) {
    return { shouldRefresh: false };
  }

  try {
    // Check if token is close to expiry
    const now = Math.floor(Date.now() / 1000);
    const exp = (payload as any).exp;

    if (!exp) {
      return { shouldRefresh: false };
    }

    const timeUntilExpiry = exp - now;
    const refreshThresholdSeconds = config.refreshThreshold * 60;

    if (timeUntilExpiry <= refreshThresholdSeconds && timeUntilExpiry > 0) {
      // Generate new token with extended expiry
      const newToken = await generateToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      await logSecurityEvent(
        request,
        "TOKEN_REFRESH",
        true,
        payload.userId,
        undefined,
        "low",
      );

      return { newToken, shouldRefresh: true };
    }

    return { shouldRefresh: false };
  } catch (error) {
    await logSecurityEvent(
      request,
      "TOKEN_REFRESH_FAILED",
      false,
      payload.userId,
      error instanceof Error ? error.message : "Unknown error",
      "medium",
    );
    return { shouldRefresh: false };
  }
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const config = DEFAULT_CONFIG;
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  try {
    // Skip middleware for static files and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/_next/") ||
      (pathname.includes(".") && !pathname.startsWith("/api/"))
    ) {
      return NextResponse.next();
    }

    // Rate limiting check using next-rate-limit
    const limiter = rateLimit({
      interval: config.rateLimit.windowMs,
      uniqueTokenPerInterval: 500, // Max number of unique tokens per interval
    });

    // Apply rate limiting - this will add the appropriate headers
    let rateLimitHeaders = {};
    try {
      const headers = limiter.checkNext(request, config.rateLimit.maxRequests);

      // If we get here, the request is within limits
      // We'll add these headers to our response later
      rateLimitHeaders = Object.fromEntries(headers.entries());
    } catch (error) {
      // If checkNext throws, the request has exceeded the rate limit
      await logSecurityEvent(
        request,
        "RATE_LIMIT_EXCEEDED",
        false,
        undefined,
        `Rate limit exceeded: 0/${config.rateLimit.maxRequests}`,
        "high",
      );

      return createErrorResponse({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        statusCode: 429,
        details: {
          retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
          limit: config.rateLimit.maxRequests,
          remaining: 0,
        },
      });
    }

    // Check if route is public
    if (isPublicRoute(pathname, config.publicRoutes)) {
      return NextResponse.next();
    }

    // Extract authentication token
    const { token, source } = extractToken(request);

    if (!token) {
      await logSecurityEvent(
        request,
        "MISSING_AUTH_TOKEN",
        false,
        undefined,
        "No authentication token provided",
        "medium",
      );

      // For API routes, return JSON error
      if (pathname.startsWith("/api/")) {
        return createErrorResponse({
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication token is required",
          statusCode: 401,
        });
      }

      // For protected pages, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify JWT token
    let payload: JWTPayload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      await logSecurityEvent(
        request,
        "INVALID_AUTH_TOKEN",
        false,
        undefined,
        error instanceof Error ? error.message : "Token verification failed",
        "high",
      );

      // For API routes, return JSON error
      if (pathname.startsWith("/api/")) {
        return createErrorResponse({
          code: "INVALID_TOKEN",
          message: "Invalid or expired authentication token",
          statusCode: 401,
        });
      }

      // For protected pages, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Create auth context
    const authContext = createAuthContext(payload, token);

    // Check role-based access control
    const requiredRoles = getRoleRequirements(pathname, config.roleBasedRoutes);
    if (requiredRoles && !authContext.hasAnyRole(requiredRoles)) {
      await logSecurityEvent(
        request,
        "INSUFFICIENT_PERMISSIONS",
        false,
        payload.userId,
        `Required roles: ${requiredRoles.join(", ")}, User role: ${
          payload.role
        }`,
        "high",
      );

      return createErrorResponse({
        code: "INSUFFICIENT_PERMISSIONS",
        message: "You do not have permission to access this resource",
        statusCode: 403,
        details: {
          requiredRoles,
          userRole: payload.role,
        },
      });
    }

    // CSRF Protection is now handled by the csurf library in API routes
    // For Next.js middleware, we'll implement basic origin checking
    if (
      config.csrf.enabled &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
      !config.csrf.excludeRoutes.some((route) => pathname.startsWith(route))
    ) {
      // Basic origin checking
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      if (origin && host) {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          await logSecurityEvent(
            request,
            "CSRF_VALIDATION_FAILED",
            false,
            payload.userId,
            `Origin mismatch: ${originHost} !== ${host}`,
            "high",
          );

          return createErrorResponse({
            code: "CSRF_TOKEN_INVALID",
            message: "CSRF protection: Origin validation failed",
            statusCode: 403,
          });
        }
      }
    }

    // Handle token refresh if needed
    const refreshResult = await handleTokenRefresh(
      request,
      payload,
      config.refreshToken,
    );

    // Create response
    const response = NextResponse.next();

    // Add auth context to request headers for API routes
    response.headers.set("x-auth-user-id", payload.userId);
    response.headers.set("x-auth-user-email", payload.email);
    response.headers.set("x-auth-user-role", payload.role);
    response.headers.set("x-auth-token-source", source || "unknown");

    // Set new token if refreshed
    if (refreshResult.shouldRefresh && refreshResult.newToken) {
      if (source === "cookie") {
        response.cookies.set("auth-token", refreshResult.newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }
      response.headers.set("x-new-auth-token", refreshResult.newToken);
    }

    // Add security headers manually since we're in middleware
    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; media-src 'self'; frame-src 'self'",
    );

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );

    // Log successful authentication
    await logSecurityEvent(
      request,
      "AUTHENTICATION_SUCCESS",
      true,
      payload.userId,
      undefined,
      "low",
    );

    // Performance monitoring
    const processingTime = Date.now() - startTime;
    response.headers.set(
      "x-middleware-processing-time",
      processingTime.toString(),
    );

    return response;
  } catch (error) {
    // Log unexpected errors
    await logSecurityEvent(
      request,
      "MIDDLEWARE_ERROR",
      false,
      undefined,
      error instanceof Error ? error.message : "Unknown middleware error",
      "critical",
    );

    console.error("Middleware error:", error);

    return createErrorResponse({
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred",
      statusCode: 500,
    });
  }
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export default middleware;
export { DEFAULT_CONFIG as defaultMiddlewareConfig };