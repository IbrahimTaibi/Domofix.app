"use client";

import { useProfile } from '@/features/profile/hooks';
import { 
  ProfileTabs,
  SummaryCard,
  ProfileSkeleton
} from '@/features/profile/components';
import ProfileHeaderPanel from '@/features/profile/components/profile-header-panel'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useProfile();

  // While auth state hydrates or profile fetch runs, show a skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // If user not yet loaded but session exists, keep skeleton to avoid white screen
  if (!isAuthenticated || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8 pb-4 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Panel */}
        <ProfileHeaderPanel user={user} />
        
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Tabs + Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ProfileTabs user={user} />
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <SummaryCard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}