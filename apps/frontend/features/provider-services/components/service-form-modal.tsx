"use client"

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/shared/components/button'
import {
  type ProviderService,
  type CreateProviderServiceDto,
  ServiceStatus,
  PricingType,
  createProviderService,
  updateProviderService,
  categoryOptions,
  pricingTypeOptions,
} from '@/features/provider-services/services/provider-services-api'
import { useToast } from '@/shared/hooks/use-toast'

interface ServiceFormModalProps {
  service?: ProviderService | null
  onClose: () => void
  onSuccess: () => void
}

export default function ServiceFormModal({ service, onClose, onSuccess }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<CreateProviderServiceDto>({
    title: '',
    description: '',
    category: '',
    pricingType: PricingType.FIXED,
    status: ServiceStatus.DRAFT,
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError } = useToast()

  // Initialize form with service data if editing
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        pricingType: service.pricingType,
        basePrice: service.basePrice,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        tags: service.tags || [],
        status: service.status,
      })
    }
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate pricing fields
      if (formData.pricingType === PricingType.FIXED || formData.pricingType === PricingType.HOURLY) {
        if (!formData.basePrice || formData.basePrice <= 0) {
          showError('Le prix de base est requis et doit être supérieur à 0')
          setIsSubmitting(false)
          return
        }
      }

      if (formData.pricingType === PricingType.RANGE) {
        if (!formData.minPrice || !formData.maxPrice) {
          showError('Les prix minimum et maximum sont requis')
          setIsSubmitting(false)
          return
        }
        if (formData.minPrice > formData.maxPrice) {
          showError('Le prix minimum ne peut pas être supérieur au prix maximum')
          setIsSubmitting(false)
          return
        }
      }

      if (service) {
        await updateProviderService(service._id, formData)
      } else {
        await createProviderService(formData)
      }

      onSuccess()
    } catch (error: any) {
      showError(error?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {service ? 'Modifier le service' : 'Créer un nouveau service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre du service *
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Installation électrique complète"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Décrivez votre service en détail..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/2000 caractères
            </p>
          </div>

          {/* Pricing Type */}
          <div>
            <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700 mb-2">
              Type de tarification *
            </label>
            <select
              id="pricingType"
              required
              value={formData.pricingType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pricingType: e.target.value as PricingType }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {pricingTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Fields */}
          {(formData.pricingType === PricingType.FIXED ||
            formData.pricingType === PricingType.HOURLY) && (
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.pricingType === PricingType.HOURLY ? 'Tarif horaire (DT)' : 'Prix fixe (DT)'} *
              </label>
              <input
                id="basePrice"
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.basePrice || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, basePrice: parseFloat(e.target.value) }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          )}

          {formData.pricingType === PricingType.RANGE && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix minimum (DT) *
                </label>
                <input
                  id="minPrice"
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={formData.minPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, minPrice: parseFloat(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum (DT) *
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={formData.maxPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maxPrice: parseFloat(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ajouter un mot-clé"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Ajouter
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 ring-1 ring-primary-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900"
                      aria-label={`Supprimer ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as ServiceStatus }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value={ServiceStatus.DRAFT}>Brouillon</option>
              <option value={ServiceStatus.ACTIVE}>Actif</option>
              <option value={ServiceStatus.INACTIVE}>Inactif</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Les services actifs sont visibles par les clients
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </div>
              ) : service ? (
                'Mettre à jour'
              ) : (
                'Créer le service'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
