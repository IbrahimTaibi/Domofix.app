// Notification preferences interface
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
}

// Security settings interface
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  trustedDevices: string[];
  passwordResetToken?: string;
  passwordResetExpires?: string;
  emailVerificationToken?: string;
  emailVerified: boolean;
}

// Phone verification interface
export interface PhoneVerification {
  verificationCode?: string;
  verificationExpires?: string;
  verified: boolean;
  attempts: number;
}

// Address interface for location data
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // For map integration
  latitude?: number;
  longitude?: number;
  // Full formatted address
  fullAddress?: string;
}

// Enhanced User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  
  // Phone and SMS fields
  phoneNumber?: string;
  countryCode?: string;
  phoneVerification: PhoneVerification;
  
  // Address and location fields
  address?: Address;
  
  // Notification preferences
  notificationPreferences: NotificationPreferences;
  
  // Security settings
  security: SecuritySettings;
  
  // User status and role
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: 'customer' | 'provider' | 'admin';
  
  // Profile completion and onboarding
  profileCompleted: boolean;
  onboardingCompleted: boolean;
  
  // Timezone and locale
  timezone: string;
  locale: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber?: string;
  countryCode?: string;
  timezone?: string;
  locale?: string;
  role?: 'customer' | 'provider';
  address?: Address;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Additional interfaces for user management
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  countryCode?: string;
  timezone?: string;
  locale?: string;
  notificationPreferences?: Partial<NotificationPreferences>;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  verificationCode: string;
}

export interface Enable2FARequest {
  secret: string;
  token: string;
}

export interface Verify2FARequest {
  token: string;
}