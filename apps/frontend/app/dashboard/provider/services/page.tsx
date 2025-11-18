"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, TrendingUp, Eye, MessageCircle, Briefcase } from 'lucide-react'
import Button from '@/shared/components/button'
import {
  getMyServices,
  getMyStats,
  ServiceStatus,
  PricingType,
  type ProviderService,
  type ProviderStats,
  type QueryServicesParams,
} from '@/features/provider-services/services/provider-services-api'
import ServiceCard from '@/features/provider-services/components/service-card'
import ServiceFormModal from '@/features/provider-services/components/service-form-modal'
import { useToast } from '@/shared/hooks/use-toast'

export default function ProviderServicesPage() {
  const [services, setServices] = useState<ProviderService[]>([])
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ProviderService | null>(null)
  const [filters, setFilters] = useState<QueryServicesParams>({
    page: 1,
    limit: 20,
  })
  const [totalPages, setTotalPages] = useState(1)
  const { showSuccess, showError } = useToast()

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await getMyServices(filters)
      setServices(response.data)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      showError(error?.message || 'Erreur lors du chargement des services')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await getMyStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchServices()
    fetchStats()
  }, [filters])

  const handleCreateService = () => {
    setEditingService(null)
    setIsFormOpen(true)
  }

  const handleEditService = (service: ProviderService) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingService(null)
    fetchServices()
    fetchStats()
    showSuccess(editingService ? 'Service mis à jour' : 'Service créé avec succès')
  }

  const handleDeleteSuccess = () => {
    fetchServices()
    fetchStats()
    showSuccess('Service supprimé')
  }

  const handleStatusChange = (status: ServiceStatus | 'all') => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }))
  }

  const handleSearch = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }))
  }

  // Calculate total stats
  const totalViews = stats?.byStatus
    ? Object.values(stats.byStatus).reduce((sum, s) => sum + (s.totalViews || 0), 0)
    : 0
  const totalInquiries = stats?.byStatus
    ? Object.values(stats.byStatus).reduce((sum, s) => sum + (s.totalInquiries || 0), 0)
    : 0
  const activeCount = stats?.byStatus?.active?.count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos services et propositions
          </p>
        </div>
        <Button
          onClick={handleCreateService}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Créer un service
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Services Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Vues</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-amber-100 p-3 rounded-lg">
                <MessageCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Demandes</p>
                <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value as ServiceStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value={ServiceStatus.ACTIVE}>Actif</option>
              <option value={ServiceStatus.INACTIVE}>Inactif</option>
              <option value={ServiceStatus.DRAFT}>Brouillon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun service trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier service
          </p>
          <Button onClick={handleCreateService} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer un service
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onEdit={handleEditService}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-gray-600">
              Page {filters.page} sur {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            disabled={filters.page === totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={() => {
            setIsFormOpen(false)
            setEditingService(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
