"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  ProfileHeader, 
  ProfileInfo, 
  AccountSettings, 
  ProfileSkeleton 
} from '@/features/profile/components';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // While auth state hydrates or profile fetch runs, show a skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // If user not yet loaded but session exists, keep skeleton to avoid white screen
  if (!isAuthenticated || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 page-content pb-4 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <ProfileHeader user={user} />
        
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* User Information Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ProfileInfo user={user} />
          </div>
          
          {/* Account Settings */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <AccountSettings user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}