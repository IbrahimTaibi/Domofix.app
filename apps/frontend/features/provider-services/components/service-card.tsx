"use client"

import React, { useState } from 'react'
import { Edit2, Trash2, Eye, MessageCircle, MoreVertical } from 'lucide-react'
import Button from '@/shared/components/button'
import { ConfirmationDialog } from '@/shared/components'
import {
  type ProviderService,
  ServiceStatus,
  deleteProviderService,
  updateServiceStatus,
} from '@/features/provider-services/services/provider-services-api'
import { useToast } from '@/shared/hooks/use-toast'

interface ServiceCardProps {
  service: ProviderService
  onEdit: (service: ProviderService) => void
  onDeleteSuccess: () => void
}

export default function ServiceCard({ service, onEdit, onDeleteSuccess }: ServiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { success, error } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProviderService(service._id)
      setShowDeleteDialog(false)
      onDeleteSuccess()
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true)
    try {
      const newStatus = service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE
      await updateServiceStatus(service._id, newStatus)
      success(`Service ${newStatus === ServiceStatus.ACTIVE ? 'activé' : 'désactivé'}`)
      onDeleteSuccess() // Refresh the list
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la mise à jour')
    } finally {
      setIsUpdatingStatus(false)
      setShowMenu(false)
    }
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return 'bg-green-100 text-green-700 ring-green-200'
      case ServiceStatus.INACTIVE:
        return 'bg-gray-100 text-gray-700 ring-gray-200'
      case ServiceStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-700 ring-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 ring-gray-200'
    }
  }

  const getStatusLabel = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return 'Actif'
      case ServiceStatus.INACTIVE:
        return 'Inactif'
      case ServiceStatus.DRAFT:
        return 'Brouillon'
      default:
        return status
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusColor(
                  service.status,
                )}`}
              >
                {getStatusLabel(service.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 capitalize">{service.category}</p>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Actions"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(service)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isUpdatingStatus}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {service.status === ServiceStatus.ACTIVE ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{service.description}</p>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-primary-600">{service.priceDisplay}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{service.viewCount} vues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>{service.inquiryCount} demandes</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Supprimer le service"
          message={`Êtes-vous sûr de vouloir supprimer "${service.title}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
