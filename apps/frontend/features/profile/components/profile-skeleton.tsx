'use client';

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 animate-pulse">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Slim Hero Skeleton */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-14 bg-gray-300"></div>
          <div className="relative px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white bg-gray-300 -mt-8"></div>
                <div>
                  <div className="h-4 sm:h-5 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="hidden sm:block w-28 h-8 bg-gray-300 rounded-md"></div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="h-4 bg-gray-300 rounded w-40"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Tabs + Summary Grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Tabs Card Skeleton */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-2 sm:px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 bg-gray-300 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-4">
                <div className="h-24 bg-gray-300 rounded"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Sticky Summary Skeleton */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-40"></div>
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}