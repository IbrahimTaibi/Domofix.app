"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Button from '@/shared/components/button'
import { AlertTriangle, Lock, Inbox } from 'lucide-react'
import Link from 'next/link'
import { useProvidersSelectionStore } from '@/features/providers/store/providers-selection-store'
import { fetchProvidersForService } from '@/features/providers/services/provider-service'
import { useToast } from '@/shared/hooks/use-toast'
import { useAuthTokenReady } from '@/features/auth/hooks/useAuthTokenReady'
import { trackEvent } from '@/shared/utils/analytics'
import { acceptProvider } from '@/features/requests/services/requests-service'
import { ProvidersHeader, ProvidersFilters, ProvidersList, SidebarSafety, SidebarStats } from '@/features/providers/components'
import { ConfirmationDialog } from '@/shared/components'

export default function ProvidersSelectionPage() {
  const params = useParams<{ serviceId: string }>()
  const serviceId = String(params?.serviceId || '')
  const { error: showError, success: showSuccess } = useToast()
  const {
    request,
    providers,
    loading,
    error,
    selected,
    filters,
    setProviders,
    setLoading,
    setError,
    toggleSelect,
    setRequest,
    setFilters,
  } = useProvidersSelectionStore()

  const priceValues = providers
    .map((p) => (p.proposedPriceRange ? p.proposedPriceRange.min : (p.proposedPrice ?? NaN)))
    .filter((v) => Number.isFinite(v)) as number[]
  const avgPrice = priceValues.length ? priceValues.reduce((a, b) => a + b, 0) / priceValues.length : null
  const minPrice = priceValues.length ? Math.min(...priceValues) : null
  const etsTimes = providers
    .map((p) => (p.proposedEts ? new Date(p.proposedEts as any).getTime() : NaN))
    .filter((t) => Number.isFinite(t)) as number[]
  const earliestEtsTime = etsTimes.length ? Math.min(...etsTimes) : null

  const { ready, expired } = useAuthTokenReady()

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingProviderId, setPendingProviderId] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!serviceId || !ready) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProvidersForService(serviceId)
        if (!mounted) return
        setRequest(res.request)
        setProviders(res.providers)
        trackEvent('providers_page_view', { requestId: serviceId })
      } catch (err: any) {
        const msg = typeof err?.message === 'string' ? err.message : 'Impossible de charger les prestataires'
        setError(msg)
        showError(msg, { title: 'Prestataires', duration: 6000 })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [serviceId, ready, setProviders, setLoading, setError, setRequest, showError])

  const filteredProviders = providers
    .filter((p) => (filters.minRating ? (p.rating || 0) >= (filters.minRating || 0) : true))
    .sort((a, b) => {
      const sort = filters.sort || 'rating'
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sort === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0)
      if (sort === 'price') {
        const am = a.pricingRange?.min ?? Infinity
        const bm = b.pricingRange?.min ?? Infinity
        return am - bm
      }
      return 0
    })

  function handleApprove(providerId: string) {
    // Show confirmation dialog instead of immediately approving
    setPendingProviderId(providerId)
    setShowConfirmDialog(true)
    trackEvent('provider_approve_click', { providerId, requestId: serviceId })
  }

  async function confirmApprove() {
    if (!pendingProviderId) return

    setIsApproving(true)
    try {
      const response = await acceptProvider(serviceId, { providerId: pendingProviderId } as any)
      showSuccess('Prestataire approuvé', { title: 'Succès' })

      // Update the request state to reflect the acceptance
      setRequest({
        ...request,
        status: 'accepted',
        acceptedProviderId: pendingProviderId,
      } as any)

      // Close the confirmation dialog
      setShowConfirmDialog(false)
      setPendingProviderId(null)

      // Auto-open widget with the conversation
      // Note: Request interface doesn't have orderId field
      // The order is created server-side but not returned in the response
      // Widget will be opened when navigating to orders page
    } catch (err: any) {
      showError(err?.message || "Échec de l'approbation", { title: 'Erreur' })
    } finally {
      setIsApproving(false)
    }
  }

  function cancelApprove() {
    setShowConfirmDialog(false)
    setPendingProviderId(null)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProvidersHeader request={request ?? undefined} />

      {(() => {
        const isAccepted = request?.status === 'accepted'
        const isClosed = request?.status === 'completed' || request?.status === 'closed'
        const acceptedProvider = isAccepted
          ? providers.find(p => p.id === (request as any)?.acceptedProviderId)
          : null

        if (isAccepted) {
          return (
            <div className="mt-3 mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 flex items-start gap-3">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Prestataire approuvé</p>
                {acceptedProvider ? (
                  <p className="text-xs mt-1">
                    Vous avez approuvé <span className="font-medium">{acceptedProvider.name}</span>.
                    Une commande a été créée et le chat est maintenant ouvert.
                  </p>
                ) : (
                  <p className="text-xs mt-1">
                    Un prestataire a été approuvé pour cette demande. La commande a été créée.
                  </p>
                )}
              </div>
            </div>
          )
        }

        if (isClosed) {
          return (
            <div className="mt-3 mb-8 rounded-lg border border-gray-300 bg-gray-50 p-4 text-gray-800 flex items-start gap-3">
              <Lock className="h-5 w-5 text-gray-700 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Demande clôturée</p>
                <p className="text-xs">Cette demande est terminée ou fermée — l'approbation est désactivée.</p>
              </div>
            </div>
          )
        }

        return null
      })()}
      <ProvidersFilters filters={filters} setFilters={setFilters} />

      {error ? (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs">Conseil: vérifiez votre connexion et réessayez.</p>
          </div>
        </div>
      ) : null}

      {!ready && expired ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="text-sm">Veuillez vous connecter pour voir les prestataires.</div>
          <div className="mt-2">
            <Link href="/auth"><Button variant="outline">Se connecter</Button></Link>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div>
          {!ready || loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Inbox className="h-6 w-6 text-gray-500" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Aucun prestataire</h3>
              <p className="mt-2 text-sm text-gray-600 max-w-md">Aucun prestataire n’a encore proposé pour cette demande.</p>
            </div>
          ) : (
            <ProvidersList
              providers={filteredProviders}
              request={request ?? undefined}
              selectedIds={selected}
              avgPrice={avgPrice}
              minPrice={minPrice}
              earliestEtsTime={earliestEtsTime}
              serviceId={serviceId}
              onApprove={handleApprove}
            />
          )}
          </div>
        </div>
        <div className="lg:sticky lg:top-20 space-y-4">
          <SidebarSafety />

          <SidebarStats
            providerCount={providers.length}
            avgPrice={avgPrice}
            minPrice={minPrice}
            earliestEts={earliestEtsTime}
          />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Confirmer l'approbation"
        message="Êtes-vous sûr de vouloir approuver ce prestataire ? Une fois approuvé, une commande sera créée et un chat sera ouvert avec le prestataire."
        confirmText="Oui, approuver"
        cancelText="Annuler"
        onConfirm={confirmApprove}
        onCancel={cancelApprove}
        isLoading={isApproving}
        variant="info"
      />
    </section>
  )
}