"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getOrderById, Order } from "@/features/orders/services/orders-service"
import { createReview } from "@/features/orders/services/reviews-service"
import OrderCard from "@/features/orders/components/order-card"
import RatingModal from "@/features/orders/components/rating-modal"
import { Spinner } from "@/shared/components/spinner"
import { useAuthStore } from "@/features/auth/store/auth-store"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const user = useAuthStore((s) => s.user)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      setLoading(true)
      setError(null)
      const data = await getOrderById(orderId)
      setOrder(data)
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement de la commande")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitRating(rating: number, comment: string) {
    if (!user?.id || !order) {
      throw new Error("User not authenticated or order not found")
    }

    const customerId = typeof order.customerId === 'object' ? order.customerId._id : order.customerId
    const providerId = typeof order.providerId === 'object' ? order.providerId._id : order.providerId
    const serviceId = order.serviceId && typeof order.serviceId === 'object' ? order.serviceId._id : order.serviceId

    const reviewData: any = {
      bookingId: order._id,
      customerId,
      providerId,
      rating,
      comment: comment || undefined,
    }

    // Only include serviceId if it exists and is not empty
    if (serviceId && serviceId !== '') {
      reviewData.serviceId = serviceId
    }

    await createReview(reviewData)
    setShowRatingModal(false)

    // Reload the order to refresh the review display in OrderCard
    await loadOrder()
  }

  function getProviderName() {
    if (order && typeof order.providerId === 'object') {
      const provider = order.providerId
      return `${provider.firstName} ${provider.lastName}`
    }
    return "Prestataire"
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Retour</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Détails de la commande</h1>
        <p className="text-sm text-gray-600 mt-1">
          Suivez l'état de votre commande et gérez son avancement.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadOrder}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      ) : order ? (
        <>
          <OrderCard
            order={order}
            onStatusChange={loadOrder}
            autoExpand={true}
            onApprovalSuccess={() => setShowRatingModal(true)}
          />

          {/* Rating Modal */}
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleSubmitRating}
            providerName={getProviderName()}
          />
        </>
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Commande introuvable</p>
        </div>
      )}
    </section>
  )
}
