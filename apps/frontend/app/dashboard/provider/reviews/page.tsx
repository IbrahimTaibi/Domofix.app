"use client"

import React, { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/auth-store"
import {
  getProviderStats,
  listReviews,
  type ReviewStats,
  type ListReviewsParams,
} from "@/features/reviews/services/reviews-api"
import type { Review } from "@domofix/shared-types"
import ReviewStatsCards from "@/features/reviews/components/review-stats-cards"
import ReviewsFilters from "@/features/reviews/components/reviews-filters"
import ReviewsList from "@/features/reviews/components/reviews-list"
import ReviewsPagination from "@/features/reviews/components/reviews-pagination"

export default function ProviderReviewsPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | "all">("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Load stats
  useEffect(() => {
    loadStats()
  }, [user?.id])

  // Load reviews when filters change
  useEffect(() => {
    loadReviews()
  }, [user?.id, selectedRating, sortOrder, currentPage])

  const loadStats = async () => {
    if (!user?.id) return

    try {
      setStatsLoading(true)
      const data = await getProviderStats()
      setStats(data)
    } catch (err: any) {
      console.error("Failed to load stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadReviews = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const params: ListReviewsParams = {
        providerId: user.id,
        page: currentPage,
        limit,
        sortOrder,
      }

      // Add rating filter if not "all"
      if (selectedRating !== "all") {
        // We'll need to filter on the client side since the backend doesn't support rating filter
        // Or we can fetch all and filter
      }

      const response = await listReviews(params)

      // Client-side filtering by rating if needed
      let filteredReviews = response.data
      if (selectedRating !== "all") {
        filteredReviews = response.data.filter((r) => r.rating === selectedRating)
      }

      setReviews(filteredReviews)
      setTotalPages(Math.ceil(response.total / limit))
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des avis")
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (rating: number | "all") => {
    setSelectedRating(rating)
    setCurrentPage(1) // Reset to first page
  }

  const handleSortOrderChange = (order: "asc" | "desc") => {
    setSortOrder(order)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRefresh = () => {
    loadStats()
    loadReviews()
  }

  return (
    <section aria-labelledby="provider-reviews-heading" className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-500" fill="currentColor" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Gestion de vos</p>
            <h1 id="provider-reviews-heading" className="text-xl font-semibold text-gray-900">
              Avis clients
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-32 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <ReviewStatsCards stats={stats} />
      ) : null}

      {/* Filters */}
      {stats && (
        <ReviewsFilters
          selectedRating={selectedRating}
          onRatingChange={handleRatingChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
          ratingCounts={stats.ratingDistribution}
          totalCount={stats.totalReviews}
        />
      )}

      {/* Reviews List */}
      <ReviewsList
        reviews={reviews}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        onReplySuccess={handleRefresh}
      />

      {/* Pagination */}
      {!loading && reviews.length > 0 && (
        <ReviewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  )
}
