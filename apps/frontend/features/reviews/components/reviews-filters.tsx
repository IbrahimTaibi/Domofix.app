"use client"

import React from "react"
import { Star } from "lucide-react"

interface ReviewsFiltersProps {
  selectedRating: number | "all"
  onRatingChange: (rating: number | "all") => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (order: "asc" | "desc") => void
  ratingCounts?: { [key: number]: number }
  totalCount?: number
}

export default function ReviewsFilters({
  selectedRating,
  onRatingChange,
  sortOrder,
  onSortOrderChange,
  ratingCounts = {},
  totalCount = 0,
}: ReviewsFiltersProps) {
  const ratings = [
    { value: "all" as const, label: "Tous les avis", count: totalCount },
    { value: 5, label: "5 étoiles", count: ratingCounts[5] || 0 },
    { value: 4, label: "4 étoiles", count: ratingCounts[4] || 0 },
    { value: 3, label: "3 étoiles", count: ratingCounts[3] || 0 },
    { value: 2, label: "2 étoiles", count: ratingCounts[2] || 0 },
    { value: 1, label: "1 étoile", count: ratingCounts[1] || 0 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Rating Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Filtrer par note
          </label>
          <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => {
              const isActive = selectedRating === rating.value
              return (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => onRatingChange(rating.value)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                  aria-pressed={isActive}
                >
                  {rating.value !== "all" && (
                    <Star
                      className="w-4 h-4"
                      fill={isActive ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  )}
                  <span>{rating.label}</span>
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-semibold
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }
                    `}
                  >
                    {rating.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort Order */}
        <div className="lg:w-48">
          <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 mb-2 block">
            Trier par date
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="desc">Plus récents</option>
            <option value="asc">Plus anciens</option>
          </select>
        </div>
      </div>
    </div>
  )
}
