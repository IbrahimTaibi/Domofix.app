import { User, RegisterRequest, LoginRequest, AuthResponse, ApiError, ProviderApplication, CreateProviderApplicationRequest, UpdatePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@domofix/shared-types';
import { httpRequest } from './http'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const isFormData = options.body instanceof FormData
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    }
    const config: RequestInit = { headers, ...options }

    const token = this.getToken()
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
    }

    try {
      return await httpRequest<T>(url, config)
    } catch (err: any) {
      // Attempt refresh and single retry for 401
      if (typeof err?.statusCode === 'number' && err.statusCode === 401) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          const retryHeaders: HeadersInit = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
          }
          const retryConfig: RequestInit = { headers: retryHeaders, ...options }
          const newToken = this.getToken()
          if (newToken) {
            retryConfig.headers = { ...retryConfig.headers, Authorization: `Bearer ${newToken}` }
          }
          return await httpRequest<T>(url, retryConfig)
        }
      }
      throw err
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data: AuthResponse & { refresh_token?: string } = await res.json();
      if (data?.access_token) {
        this.setToken(data.access_token);
      }
      if (data?.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }
      return !!data?.access_token;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.access_token);
    if (response.refresh_token) this.setRefreshToken(response.refresh_token);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.access_token);
    if (response.refresh_token) this.setRefreshToken(response.refresh_token);
    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      if (token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        }).catch(() => {});
      }
    } finally {
      this.removeToken();
      this.removeRefreshToken();
    }
  }

  // Allow external auth flows (e.g., NextAuth) to store backend JWT
  setAuthToken(token: string): void {
    this.setToken(token);
  }

  // Provider application endpoints
  async applyProviderWithDocument(data: CreateProviderApplicationRequest, documentFile: File): Promise<ProviderApplication> {
    const form = new FormData();
    form.append('businessName', data.businessName);
    form.append('phone', data.phone);
    form.append('category', data.category);
    if (data.notes) form.append('notes', data.notes);
    form.append('document', documentFile);

    return this.request<ProviderApplication>('/provider-applications/apply', {
      method: 'POST',
      body: form,
    });
  }

  async getMyProviderApplication(): Promise<ProviderApplication | null> {
    return this.request<ProviderApplication | null>('/provider-applications/me');
  }

  // Account endpoints
  async changePassword(payload: UpdatePasswordRequest): Promise<User> {
    return this.request<User>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ ok: boolean }>{
    return this.request<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<User>{
    return this.request<User>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiClient = new ApiClient();
export default apiClient;