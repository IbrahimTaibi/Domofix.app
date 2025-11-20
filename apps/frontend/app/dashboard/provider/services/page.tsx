"use client"

import React, { useState, useEffect } from 'react'
import {
  getMyServices,
  getMyStats,
  ServiceStatus,
  type ProviderService,
  type ProviderStats,
  type QueryServicesParams,
} from '@/features/provider-services/services/provider-services-api'
import ServicesPageHeader from '@/features/provider-services/components/services-page-header'
import ServicesStatsCards from '@/features/provider-services/components/services-stats-cards'
import ServicesFilters from '@/features/provider-services/components/services-filters'
import ServicesList from '@/features/provider-services/components/services-list'
import ServicesPagination from '@/features/provider-services/components/services-pagination'
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
  const { success: showSuccess, error: showError } = useToast()

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

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ServicesPageHeader onCreateService={handleCreateService} />

      {/* Stats Cards */}
      {stats && <ServicesStatsCards stats={stats} />}

      {/* Filters */}
      <ServicesFilters
        currentStatus={filters.status}
        onStatusChange={handleStatusChange}
        onSearch={handleSearch}
      />

      {/* Services List */}
      <ServicesList
        services={services}
        loading={loading}
        onEdit={handleEditService}
        onDeleteSuccess={handleDeleteSuccess}
        onCreateService={handleCreateService}
      />

      {/* Pagination */}
      <ServicesPagination
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
