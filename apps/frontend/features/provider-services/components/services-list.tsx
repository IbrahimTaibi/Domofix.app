"use client"

import React from 'react'
import { Plus, Briefcase } from 'lucide-react'
import Button from '@/shared/components/button'
import ServiceCard from './service-card'
import type { ProviderService } from '@/features/provider-services/services/provider-services-api'

interface ServicesListProps {
  services: ProviderService[]
  loading: boolean
  onEdit: (service: ProviderService) => void
  onDeleteSuccess: () => void
  onCreateService: () => void
}

export default function ServicesList({
  services,
  loading,
  onEdit,
  onDeleteSuccess,
  onCreateService,
}: ServicesListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun service trouvé
        </h3>
        <p className="text-gray-600 mb-4">
          Commencez par créer votre premier service
        </p>
        <Button onClick={onCreateService} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un service
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service._id}
          service={service}
          onEdit={onEdit}
          onDeleteSuccess={onDeleteSuccess}
        />
      ))}
    </div>
  )
}
