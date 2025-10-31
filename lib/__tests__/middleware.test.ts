import { NextRequest, NextResponse } from 'next/server';
import { middleware, UserRole } from '@/middleware';
import { verifyToken, generateToken } from '@/lib/jwt';

// Mock dependencies
jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(() => 'new-token'),
  JWTPayload: {}
}));

jest.mock('@/lib/utils/audit-logger', () => ({
  auditLogger: {
    log: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('next-secure-headers', () => ({
  secureHeaders: jest.fn(() => ({
    'content-security-policy': 'default-src \'self\'',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff'
  }))
}));

jest.mock('next-rate-limit', () => {
  return {
    RateLimiter: jest.fn().mockImplementation(() => ({
      check: jest.fn().mockResolvedValue({ success: true, remaining: 99 })
    }))
  };
});

// Helper to create mock requests
function createMockRequest(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const { url, method = 'GET', headers = {}, cookies = {} } = options;
  
  // Create headers object
  const headersObj = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    headersObj.set(key, value);
  });
  
  // Create cookies
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  if (cookieString) {
    headersObj.set('cookie', cookieString);
  }
  
  // Create request
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: headersObj
  });
  
  // Mock cookies API
  req.cookies = {
    get: (name: string) => cookies[name] ? { name, value: cookies[name] } : undefined,
    getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    has: (name: string) => name in cookies,
    set: jest.fn(),
    delete: jest.fn()
  } as any;
  
  // Mock IP
  Object.defineProperty(req, 'ip', {
    get: () => '127.0.0.1'
  });
  
  return req;
}

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => ({
        headers: new Map(),
        cookies: {
          set: jest.fn()
        }
      })),
      json: jest.fn((body, options) => ({
        body,
        status: options?.status || 200,
        headers: new Map()
      }))
    }
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Authentication', () => {
    test('should allow access to public routes without authentication', async () => {
      const req = createMockRequest({ url: '/' });
      await middleware(req);
      
      expect(NextResponse.next).toHaveBeenCalled();
      expect(verifyToken).not.toHaveBeenCalled();
    });
    
    test('should require authentication for protected routes', async () => {
      const req = createMockRequest({ url: '/profile' });
      await middleware(req);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'AUTHENTICATION_REQUIRED'
        }),
        expect.objectContaining({ status: 401 })
      );
    });
    
    test('should validate JWT token for protected routes', async () => {
      const req = createMockRequest({
        url: '/profile',
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer'
      });
      
      await middleware(req);
      
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(NextResponse.next).toHaveBeenCalled();
    });
    
    test('should reject invalid tokens', async () => {
      const req = createMockRequest({
        url: '/profile',
        cookies: { 'auth-token': 'invalid-token' }
      });
      
      (verifyToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      await middleware(req);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'INVALID_TOKEN'
        }),
        expect.objectContaining({ status: 401 })
      );
    });
  });
  
  describe('Role-based access control', () => {
    test('should allow access to role-specific routes with correct role', async () => {
      const req = createMockRequest({
        url: '/provider/dashboard',
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'provider123',
        email: 'provider@example.com',
        role: 'provider'
      });
      
      await middleware(req);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });
    
    test('should deny access to role-specific routes with incorrect role', async () => {
      const req = createMockRequest({
        url: '/admin',
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer'
      });
      
      await middleware(req);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS'
        }),
        expect.objectContaining({ status: 403 })
      );
    });
  });
  
  describe('Security headers', () => {
    test('should add security headers to responses', async () => {
      const req = createMockRequest({
        url: '/'
      });
      
      await middleware(req);
      
      const response = (NextResponse.next as jest.Mock).mock.results[0].value;
      
      // Check that headers are set from secureHeaders
      expect(response.headers.has('content-security-policy')).toBe(true);
      expect(response.headers.has('x-frame-options')).toBe(true);
      expect(response.headers.has('x-content-type-options')).toBe(true);
    });
  });
  
  describe('Rate limiting', () => {
    test('should apply rate limiting to requests', async () => {
      const { RateLimiter } = require('next-rate-limit');
      const mockCheck = jest.fn().mockResolvedValue({ success: true, remaining: 99 });
      
      RateLimiter.mockImplementationOnce(() => ({
        check: mockCheck
      }));
      
      const req = createMockRequest({
        url: '/api/profile',
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer'
      });
      
      await middleware(req);
      
      expect(RateLimiter).toHaveBeenCalled();
      expect(mockCheck).toHaveBeenCalledWith(req);
    });
    
    test('should block requests that exceed rate limits', async () => {
      const { RateLimiter } = require('next-rate-limit');
      const mockCheck = jest.fn().mockResolvedValue({
        success: false,
        remaining: 0,
        retryAfter: 60
      });
      
      RateLimiter.mockImplementationOnce(() => ({
        check: mockCheck
      }));
      
      const req = createMockRequest({
        url: '/api/profile',
        cookies: { 'auth-token': 'valid-token' }
      });
      
      await middleware(req);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED'
        }),
        expect.objectContaining({ status: 429 })
      );
    });
  });
  
  describe('CSRF protection', () => {
    test('should validate origin for state-changing requests', async () => {
      const req = createMockRequest({
        url: '/api/profile/update',
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3000',
          'host': 'localhost:3000'
        },
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer'
      });
      
      await middleware(req);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });
    
    test('should block requests with mismatched origin', async () => {
      const req = createMockRequest({
        url: '/api/profile/update',
        method: 'POST',
        headers: {
          'origin': 'http://evil-site.com',
          'host': 'localhost:3000'
        },
        cookies: { 'auth-token': 'valid-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer'
      });
      
      await middleware(req);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'CSRF_TOKEN_INVALID'
        }),
        expect.objectContaining({ status: 403 })
      );
    });
  });
  
  describe('Token refresh', () => {
    test('should refresh tokens close to expiry', async () => {
      const now = Math.floor(Date.now() / 1000);
      const req = createMockRequest({
        url: '/profile',
        cookies: { 'auth-token': 'expiring-token' }
      });
      
      (verifyToken as jest.Mock).mockReturnValueOnce({
        userId: 'user123',
        email: 'user@example.com',
        role: 'customer',
        exp: now + 25 * 60 // 25 minutes until expiry (within refresh threshold)
      });
      
      await middleware(req);
      
      expect(generateToken).toHaveBeenCalled();
      
      const response = (NextResponse.next as jest.Mock).mock.results[0].value;
      expect(response.cookies.set).toHaveBeenCalledWith(
        'auth-token',
        'new-token',
        expect.any(Object)
      );
    });
  });
});