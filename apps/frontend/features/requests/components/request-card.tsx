"use client"

import React from "react"
import { MapPin, Calendar, User, Phone } from "lucide-react"
import { Request } from "@domofix/shared-types"
import { categoryOptions } from "@/features/requests/services/requests-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RequestCardProps {
  request: Request
  onRefresh?: () => void
}

export default function RequestCard({ request, onRefresh }: RequestCardProps) {
  const categoryLabel = categoryOptions.find(c => c.value === request.category)?.label || request.category

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    closed: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    open: "Ouverte",
    pending: "En attente",
    accepted: "Acceptée",
    completed: "Terminée",
    closed: "Fermée",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{categoryLabel}</h3>
          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || "bg-gray-100 text-gray-800"}`}>
            {statusLabels[request.status] || request.status}
          </span>
        </div>
      </div>

      {/* Details */}
      {request.details && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.details}</p>
      )}

      {/* Location */}
      {request.location && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {request.location.address || request.location.city || "Localisation non spécifiée"}
          </span>
        </div>
      )}

      {/* Date */}
      {request.estimatedTimeOfService && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>
            {format(new Date(request.estimatedTimeOfService), "dd MMM yyyy à HH:mm", { locale: fr })}
          </span>
        </div>
      )}

      {/* Phone */}
      {request.phone && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{request.phone}</span>
        </div>
      )}

      {/* Applications count */}
      {request.applications && request.applications.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User className="w-4 h-4 flex-shrink-0" />
          <span>
            {request.applications.length} candidature{request.applications.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <a
          href={`/dashboard/provider/requests/${request.id}`}
          className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors text-center"
        >
          Voir détails
        </a>
      </div>
    </div>
  )
}
