'use client';

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Photo Skeleton */}
          <div className="h-24 sm:h-32 bg-gray-300"></div>
          
          {/* Profile Content Skeleton */}
          <div className="relative px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
              {/* Profile Picture Skeleton */}
              <div className="relative mb-4 sm:mb-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-300 mx-auto sm:mx-0"></div>
              </div>
              
              {/* Edit Button Skeleton */}
              <div className="w-full sm:w-32 h-10 bg-gray-300 rounded-md mb-4"></div>
            </div>
            
            {/* User Info Skeleton */}
            <div className="mt-4 text-center sm:text-left">
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-48 mx-auto sm:mx-0 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-24 mx-auto sm:mx-0 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full max-w-md mx-auto sm:mx-0 mb-4"></div>
              
              {/* Contact Info Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="h-4 bg-gray-300 rounded w-48 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* User Information Section Skeleton */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-300 rounded w-40"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Account Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Account Settings Skeleton */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-300 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}