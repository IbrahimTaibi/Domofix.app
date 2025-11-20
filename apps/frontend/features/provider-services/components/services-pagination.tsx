"use client"

import React from 'react'
import Button from '@/shared/components/button'

interface ServicesPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ServicesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ServicesPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Précédent
      </Button>
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm text-gray-600">
          Page {currentPage} sur {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Suivant
      </Button>
    </div>
  )
}
