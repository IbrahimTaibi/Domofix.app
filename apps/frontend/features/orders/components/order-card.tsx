"use client"

import React, { useState, useEffect } from "react"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Tag,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react"
import { Order, OrderStatus, updateOrderStatus, approveOrderCompletion, declineOrderCompletion } from "../services/orders-service"
import { getReviewByBookingId, Review } from "../services/reviews-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getCategoryLabel } from "@/shared/utils/category-labels"
import { useWidgetStore } from "@/features/widget/store/widget-store"
import { useMessagesStore as useWidgetMessagesStore } from "@/features/widget/store/messages-store"
import { useAuthStore } from "@/features/auth/store/auth-store"

interface OrderCardProps {
  order: Order
  onStatusChange?: () => void
  autoExpand?: boolean
  onApprovalSuccess?: () => void
}

const STATUS_CONFIG = {
  assigned: {
    label: "Assignée",
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: Package,
  },
  in_progress: {
    label: "En cours",
    color: "amber",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: PlayCircle,
  },
  pending_completion: {
    label: "En attente d'approbation",
    color: "purple",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: Clock,
  },
  completed: {
    label: "Terminée",
    color: "green",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: CheckCircle,
  },
  canceled: {
    label: "Annulée",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: XCircle,
  },
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  )
}

export default function OrderCard({ order, onStatusChange, autoExpand = false, onApprovalSuccess }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand)
  const [isUpdating, setIsUpdating] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)

  const config = STATUS_CONFIG[order.status]
  const StatusIcon = config.icon

  // Widget store
  const setWidgetOpen = useWidgetStore((s) => s.setOpen)
  const setWidgetTab = useWidgetStore((s) => s.setTab)
  const openThreadForOrder = useWidgetMessagesStore((s) => s.openThreadForOrder)
  const user = useAuthStore((s) => s.user)

  // Determine if current user is the customer
  const customerId = typeof order.customerId === 'object' ? order.customerId._id : order.customerId
  const isCustomer = user?.id === customerId

  // Provider actions
  const canStartProgress = order.status === "assigned" && !isCustomer
  const canRequestCompletion = order.status === "in_progress" && !isCustomer

  // Customer actions for pending completion
  const canApproveOrDecline = order.status === "pending_completion" && isCustomer

  // Customer can rate if order is completed and hasn't rated yet
  const canRate = order.status === "completed" && isCustomer && !existingReview

  // Load existing review if order is completed
  useEffect(() => {
    if (order.status === "completed" && isCustomer) {
      loadExistingReview()
    }
  }, [order._id, order.status, isCustomer])

  async function loadExistingReview() {
    try {
      setLoadingReview(true)
      const review = await getReviewByBookingId(order._id)
      setExistingReview(review)
    } catch (error) {
      console.error("Failed to load review:", error)
    } finally {
      setLoadingReview(false)
    }
  }

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (isUpdating) return

    try {
      setIsUpdating(true)
      await updateOrderStatus(order._id, newStatus)
      onStatusChange?.()
    } catch (error: any) {
      console.error("Failed to update order status:", error)
      alert(error?.message || "Erreur lors de la mise à jour du statut")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleApproveCompletion() {
    if (isUpdating) return

    try {
      setIsUpdating(true)
      await approveOrderCompletion(order._id)
      // Notify parent to show rating modal
      onApprovalSuccess?.()
      onStatusChange?.()
    } catch (error: any) {
      console.error("Failed to approve completion:", error)
      alert(error?.message || "Erreur lors de l'approbation")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeclineCompletion() {
    if (isUpdating) return

    const confirmed = confirm("Êtes-vous sûr de vouloir refuser la terminaison ? Le prestataire devra continuer le travail.")
    if (!confirmed) return

    try {
      setIsUpdating(true)
      await declineOrderCompletion(order._id)
      onStatusChange?.()
    } catch (error: any) {
      console.error("Failed to decline completion:", error)
      alert(error?.message || "Erreur lors du refus")
    } finally {
      setIsUpdating(false)
    }
  }

  function handleOpenChat() {
    if (!user?.id) return

    // Open widget and navigate to messages tab
    setWidgetTab("messages")
    setWidgetOpen(true)

    // Open the thread for this order
    const request = typeof order.requestId === 'object' ? order.requestId : null
    const requestDisplayId = request?._id || order._id
    openThreadForOrder(order._id, requestDisplayId, user.id)
  }

  const customer = typeof order.customerId === 'object' ? order.customerId : null
  const provider = typeof order.providerId === 'object' ? order.providerId : null
  const request = typeof order.requestId === 'object' ? order.requestId : null
  const service = order.serviceId && typeof order.serviceId === 'object' ? order.serviceId : null

  function getCustomerName() {
    if (customer) {
      return `${customer.firstName} ${customer.lastName}`
    }
    return "Client"
  }

  function getProviderName() {
    if (provider) {
      return `${provider.firstName} ${provider.lastName}`
    }
    return "Prestataire"
  }

  function getCustomerInitials() {
    if (customer) {
      return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase()
    }
    return "C"
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Customer Avatar */}
          <div className="flex-shrink-0">
            {customer?.avatar ? (
              <img
                src={customer.avatar}
                alt={getCustomerName()}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold ring-2 ring-white shadow-md">
                {getCustomerInitials()}
              </div>
            )}
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {service?.title || (request?.category ? getCategoryLabel(request.category) : "Commande")}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                    <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Chat Button */}
                <button
                  onClick={handleOpenChat}
                  className="p-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                  aria-label="Ouvrir le chat"
                  title="Ouvrir le chat"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* Expand Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label={isExpanded ? "Réduire" : "Développer"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium">{getCustomerName()}</span>
              </div>
              {request?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{request.phone}</span>
                </div>
              )}
              {request?.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{getCategoryLabel(request.category)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <span className="text-gray-600">Acceptée le : </span>
                <span className="font-semibold text-gray-900">
                  {format(new Date(order.acceptedAt), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>

            {order.startedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Démarrée le : </span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(order.startedAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            )}

            {order.completionRequestedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Terminaison demandée le : </span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(order.completionRequestedAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Terminée le : </span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(order.completedAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            )}

            {order.canceledAt && (
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Annulée le : </span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(order.canceledAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          {request?.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-gray-600">Adresse : </span>
                <span className="font-semibold text-gray-900">
                  {request.address.street}, {request.address.city}
                </span>
              </div>
            </div>
          )}

          {/* Details */}
          {request?.details && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-semibold mb-1">Détails de la demande :</p>
              <p className="text-sm text-gray-900">{request.details}</p>
            </div>
          )}

          {/* Customer Email */}
          {customer?.email && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Email : </span>
              <a
                href={`mailto:${customer.email}`}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {customer.email}
              </a>
            </div>
          )}

          {/* Existing Review Display */}
          {existingReview && (
            <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900">Votre évaluation</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= existingReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {existingReview.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">{existingReview.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Évalué le {format(new Date(existingReview.createdAt), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          )}

          {/* Rate Button in Details Section */}
          {canRate && (
            <button
              onClick={() => onApprovalSuccess?.()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <Star className="w-4 h-4" />
              Évaluer le prestataire
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex items-center gap-3 flex-wrap rounded-b-xl">
        {canStartProgress && (
          <button
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md disabled:cursor-not-allowed"
          >
            <PlayCircle className="w-4 h-4" aria-hidden="true" />
            Démarrer
          </button>
        )}

        {canRequestCompletion && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Terminer
          </button>
        )}

        {canApproveOrDecline && (
          <>
            <button
              onClick={handleApproveCompletion}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              Approuver la terminaison
            </button>
            <button
              onClick={handleDeclineCompletion}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" aria-hidden="true" />
              Refuser
            </button>
          </>
        )}

        {isUpdating && (
          <span className="text-sm text-gray-500 ml-auto font-medium">Mise à jour...</span>
        )}
      </div>
    </div>
  )
}
