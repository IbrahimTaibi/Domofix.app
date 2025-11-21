"use client"

import React, { useState } from "react"
import {
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Order, OrderStatus, updateOrderStatus } from "../services/orders-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getCategoryLabel } from "@/shared/utils/category-labels"

interface OrderCardProps {
  order: Order
  onStatusChange?: () => void
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

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const config = STATUS_CONFIG[order.status]
  const StatusIcon = config.icon

  const canStartProgress = order.status === "assigned"
  const canComplete = order.status === "in_progress"
  const canCancel = order.status === "assigned" || order.status === "in_progress"

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

  const customer = typeof order.customerId === 'object' ? order.customerId : null
  const request = typeof order.requestId === 'object' ? order.requestId : null
  const service = order.serviceId && typeof order.serviceId === 'object' ? order.serviceId : null

  function getCustomerName() {
    if (customer) {
      return `${customer.firstName} ${customer.lastName}`
    }
    return "Client"
  }

  function getCustomerInitials() {
    if (customer) {
      return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase()
    }
    return "C"
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Customer Avatar */}
            <div className="flex-shrink-0">
              {customer?.avatar ? (
                <img
                  src={customer.avatar}
                  alt={getCustomerName()}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-gray-100">
                  {getCustomerInitials()}
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">
                  {service?.title || (request?.category ? getCategoryLabel(request.category) : "Commande")}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                  <StatusIcon className="w-3 h-3" aria-hidden="true" />
                  {config.label}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{getCustomerName()}</span>
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

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? "Réduire" : "Développer"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-b border-gray-100 bg-gray-50">
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <span className="text-gray-600">Acceptée le : </span>
                <span className="font-medium text-gray-900">
                  {format(new Date(order.acceptedAt), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>

            {order.startedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Démarrée le : </span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(order.startedAt), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gray-600">Terminée le : </span>
                  <span className="font-medium text-gray-900">
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
                  <span className="font-medium text-gray-900">
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
                <span className="font-medium text-gray-900">
                  {request.address.street}, {request.address.city}
                </span>
              </div>
            </div>
          )}

          {/* Details */}
          {request?.details && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Détails de la demande :</p>
              <p className="text-sm text-gray-900">{request.details}</p>
            </div>
          )}

          {/* Customer Email */}
          {customer?.email && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Email : </span>
              <a
                href={`mailto:${customer.email}`}
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {customer.email}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-3 flex-wrap">
        {canStartProgress && (
          <button
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <PlayCircle className="w-4 h-4" aria-hidden="true" />
            Démarrer
          </button>
        )}

        {canComplete && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Terminer
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => handleStatusUpdate("canceled")}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            Annuler
          </button>
        )}

        {isUpdating && (
          <span className="text-sm text-gray-500 ml-auto">Mise à jour...</span>
        )}
      </div>
    </div>
  )
}
