"use client"

import React from "react"
import { Star, MessageSquare, TrendingUp, BarChart3 } from "lucide-react"
import type { ReviewStats } from "../services/reviews-api"

interface ReviewStatsCardsProps {
  stats: ReviewStats
}

export default function ReviewStatsCards({ stats }: ReviewStatsCardsProps) {
  const { totalReviews, averageRating, ratingDistribution, recentReviewsCount } = stats

  // Calculate percentage of 5-star reviews
  const fiveStarPercentage = totalReviews > 0
    ? Math.round((ratingDistribution[5] / totalReviews) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Rating Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" fill="currentColor" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {averageRating.toFixed(1)}
                <span className="text-sm text-gray-500 font-normal ml-1">/ 5</span>
              </p>
            </div>
          </div>
        </div>
        {/* Star rating visualization */}
        <div className="flex items-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(averageRating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Total Reviews Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total avis</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalReviews}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Tous vos avis clients
        </div>
      </div>

      {/* Recent Reviews Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Ce mois-ci</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{recentReviewsCount}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Avis reçus (30 derniers jours)
        </div>
      </div>

      {/* 5-Star Percentage Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Avis 5 étoiles</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {fiveStarPercentage}%
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          {ratingDistribution[5]} sur {totalReviews} avis
        </div>
      </div>
    </div>
  )
}
