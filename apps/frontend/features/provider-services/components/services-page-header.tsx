"use client"

import React from 'react'
import { Plus } from 'lucide-react'
import Button from '@/shared/components/button'

interface ServicesPageHeaderProps {
  onCreateService: () => void
}

export default function ServicesPageHeader({ onCreateService }: ServicesPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Services</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos services et propositions
        </p>
      </div>
      <Button
        onClick={onCreateService}
        className="inline-flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Créer un service
      </Button>
    </div>
  )
}
