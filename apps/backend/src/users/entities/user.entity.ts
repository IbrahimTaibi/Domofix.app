import { User as SharedUser, Address, NotificationPreferences, SecuritySettings, PhoneVerification } from '@darigo/shared-types';

export class User implements Omit<SharedUser, 'createdAt' | 'updatedAt'> {
  id: string;
  email: string;
  password: string; // This field is not in shared User interface (for security)
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
  
  createdAt: Date; // Backend uses Date objects
  updatedAt: Date; // Backend uses Date objects

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}