"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react"
import { getProviderRequestById, applyForRequest, Request, categoryOptions } from "@/features/requests/services/requests-service"
import { Spinner } from "@/shared/components/spinner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "@/features/auth/components/providers/auth-provider"

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const requestId = params.id as string

  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  // Application form state
  const [proposedPrice, setProposedPrice] = useState("")
  const [proposedPriceMin, setProposedPriceMin] = useState("")
  const [proposedPriceMax, setProposedPriceMax] = useState("")
  const [message, setMessage] = useState("")
  const [proposedEts, setProposedEts] = useState("")

  useEffect(() => {
    loadRequest()
  }, [requestId])

  async function loadRequest() {
    try {
      setLoading(true)
      setError(null)
      const data = await getProviderRequestById(requestId)
      setRequest(data)
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement de la demande")
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!request || applying) return

    try {
      setApplying(true)
      setError(null)

      const payload: any = { message }

      if (proposedPrice) {
        payload.proposedPrice = parseFloat(proposedPrice)
      }
      if (proposedPriceMin && proposedPriceMax) {
        payload.proposedPriceMin = parseFloat(proposedPriceMin)
        payload.proposedPriceMax = parseFloat(proposedPriceMax)
      }
      if (proposedEts) {
        payload.proposedEts = new Date(proposedEts).toISOString()
      }

      await applyForRequest(requestId, payload)
      await loadRequest()
      setShowApplicationForm(false)
      setMessage("")
      setProposedPrice("")
      setProposedPriceMin("")
      setProposedPriceMax("")
      setProposedEts("")
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la candidature")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadRequest}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!request) return null

  const categoryLabel = categoryOptions.find(c => c.value === request.category)?.label || request.category
  const hasApplied = user && request.applications?.some(app => app.providerId === user.id)
  const canApply = request.status === "open" && !hasApplied

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
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux demandes
      </button>

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || "bg-gray-100 text-gray-800"}`}>
              {statusLabels[request.status] || request.status}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{categoryLabel}</h1>
            <p className="text-sm text-gray-600">
              Demande créée le {format(new Date(request.createdAt), "dd MMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la demande</h2>

            {request.details && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{request.details}</p>
              </div>
            )}

            <div className="space-y-3">
              {request.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Localisation</p>
                    <p className="text-sm text-gray-600">
                      {request.location.address || request.location.city || "Non spécifiée"}
                      {request.location.city && `, ${request.location.city}`}
                      {request.location.state && `, ${request.location.state}`}
                      {request.location.zipCode && ` ${request.location.zipCode}`}
                    </p>
                  </div>
                </div>
              )}

              {request.estimatedTimeOfService && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date souhaitée</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(request.estimatedTimeOfService), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              {request.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone</p>
                    <p className="text-sm text-gray-600">{request.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photos ({request.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {request.applications && request.applications.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Candidatures ({request.applications.length})
              </h2>
              <div className="space-y-4">
                {request.applications.map((app, index) => {
                  const isMyApplication = user && app.providerId === user.id
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${isMyApplication ? "border-primary-200 bg-primary-50" : "border-gray-200 bg-gray-50"}`}
                    >
                      {isMyApplication && (
                        <span className="inline-block mb-2 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">
                          Votre candidature
                        </span>
                      )}
                      <div className="space-y-2">
                        {app.proposedPrice && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{app.proposedPrice} €</span>
                          </div>
                        )}
                        {app.proposedPriceMin && app.proposedPriceMax && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{app.proposedPriceMin} € - {app.proposedPriceMax} €</span>
                          </div>
                        )}
                        {app.proposedEts && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(app.proposedEts), "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                          </div>
                        )}
                        {app.message && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p>{app.message}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Candidature déposée le {format(new Date(app.appliedAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply button */}
          {canApply && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Postuler</h3>
              {!showApplicationForm ? (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Postuler à cette demande
                </button>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Votre message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Décrivez votre expérience et pourquoi vous êtes le bon choix..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix proposé (€)
                    </label>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="150"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix min (€)
                      </label>
                      <input
                        type="number"
                        value={proposedPriceMin}
                        onChange={(e) => setProposedPriceMin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="100"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix max (€)
                      </label>
                      <input
                        type="number"
                        value={proposedPriceMax}
                        onChange={(e) => setProposedPriceMax(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="200"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date proposée
                    </label>
                    <input
                      type="datetime-local"
                      value={proposedEts}
                      onChange={(e) => setProposedEts(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={applying}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={applying}
                    >
                      {applying ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Already applied */}
          {hasApplied && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-1">Candidature envoyée</h3>
                  <p className="text-sm text-green-700">
                    Vous avez déjà postulé à cette demande. Le client examinera votre candidature.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request closed */}
          {request.status !== "open" && !hasApplied && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">Demande fermée</h3>
                  <p className="text-sm text-gray-600">
                    Cette demande n'accepte plus de nouvelles candidatures.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Client
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ID: {request.customerId}
              </p>
              {request.phone && (
                <a
                  href={`tel:${request.phone}`}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Phone className="w-4 h-4" />
                  {request.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
