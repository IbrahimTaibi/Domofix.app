"use client"

import React from "react"
import { Star, Inbox } from "lucide-react"
import type { Review } from "@domofix/shared-types"
import ReviewCard from "./review-card"
import { Spinner } from "@/shared/components/spinner"

interface ReviewsListProps {
  reviews: Review[]
  loading: boolean
  error?: string | null
  onRefresh?: () => void
  onReplySuccess?: () => void
}

export default function ReviewsList({
  reviews,
  loading,
  error,
  onRefresh,
  onReplySuccess,
}: ReviewsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Inbox className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun avis pour le moment
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Vous n'avez pas encore reçu d'avis clients. Les avis apparaîtront ici une fois que vos clients auront évalué vos services.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onReplySuccess={onReplySuccess}
        />
      ))}
    </div>
  )
}
