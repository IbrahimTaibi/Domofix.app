import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// Notification preferences sub-schema
@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ default: true })
  email: boolean;

  @Prop({ default: false })
  sms: boolean;

  @Prop({ default: true })
  push: boolean;

  @Prop({ default: true })
  marketing: boolean;

  @Prop({ default: true })
  security: boolean;
}

// Security settings sub-schema
@Schema({ _id: false })
export class SecuritySettings {
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ default: null })
  twoFactorSecret: string;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ default: null })
  lockedUntil: Date;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  lastLoginIP: string;

  @Prop({ default: [] })
  trustedDevices: string[];

  @Prop({ default: null })
  passwordResetToken: string;

  @Prop({ default: null })
  passwordResetExpires: Date;

  @Prop({ default: null })
  emailVerificationToken: string;

  @Prop({ default: false })
  emailVerified: boolean;
}

// Phone verification sub-schema
@Schema({ _id: false })
export class PhoneVerification {
  @Prop({ default: null })
  verificationCode: string;

  @Prop({ default: null })
  verificationExpires: Date;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 0 })
  attempts: number;
}

// Address sub-schema
@Schema({ _id: false })
export class Address {
  @Prop({ default: null })
  street?: string;

  @Prop({ default: null })
  city?: string;

  @Prop({ default: null })
  state?: string;

  @Prop({ default: null })
  postalCode?: string;

  @Prop({ default: null })
  country?: string;

  // For map integration
  @Prop({ default: null })
  latitude?: number;

  @Prop({ default: null })
  longitude?: number;

  // Full formatted address
  @Prop({ default: null })
  fullAddress?: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: null })
  avatar: string;

  // Phone and SMS fields
  @Prop({ default: null })
  phoneNumber: string;

  @Prop({ default: null })
  countryCode: string;

  @Prop({ type: PhoneVerification, default: () => ({}) })
  phoneVerification: PhoneVerification;

  // Address and location fields
  @Prop({ type: Address, default: () => ({}) })
  address: Address;

  // Notification preferences
  @Prop({ type: NotificationPreferences, default: () => ({}) })
  notificationPreferences: NotificationPreferences;

  // Security settings
  @Prop({ type: SecuritySettings, default: () => ({}) })
  security: SecuritySettings;

  // User status and role
  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended', 'pending'] })
  status: string;

  @Prop({ default: 'customer', enum: ['customer', 'provider', 'admin'] })
  role: string;

  // Profile completion and onboarding
  @Prop({ default: false })
  profileCompleted: boolean;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  // Timezone and locale
  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'en' })
  locale: string;

  // These will be automatically added by Mongoose due to timestamps: true
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ 'security.emailVerificationToken': 1 });
UserSchema.index({ 'security.passwordResetToken': 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });