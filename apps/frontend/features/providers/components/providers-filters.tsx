"use client"

import React from 'react'

export interface ProvidersFiltersProps {
  filters: { sort?: 'rating' | 'reviews' | 'price' | 'availability'; minRating?: number }
  setFilters: (f: ProvidersFiltersProps['filters']) => void
}

export default function ProvidersFilters({ filters, setFilters }: ProvidersFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="text-sm text-gray-700">Trier par:</label>
      <select
        value={filters.sort || 'rating'}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value as 'rating' | 'reviews' | 'price' | 'availability' })}
        className="text-sm border rounded-md px-2 py-1"
      >
        <option value="rating">Note</option>
        <option value="price">Prix</option>
        <option value="reviews">Avis</option>
        <option value="availability">Disponibilité</option>
      </select>
      <label className="ml-4 text-sm text-gray-700">Filtrer:</label>
      <select
        value={filters.minRating || ''}
        onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) || undefined })}
        className="text-sm border rounded-md px-2 py-1"
      >
        <option value="">Note minimale</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="4.5">4.5+</option>
      </select>
    </div>
  )
}