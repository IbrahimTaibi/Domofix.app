"use client"

import React, { useState, useEffect } from "react"
import { ClipboardList, AlertCircle } from "lucide-react"
import { listProviderAllRequests, Request } from "@/features/requests/services/requests-service"
import { RequestStatus } from "@domofix/shared-types"
import { Spinner } from "@/shared/components/spinner"
import RequestCard from "@/features/requests/components/request-card"

type FilterStatus = RequestStatus | "all"

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("open")

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, activeFilter])

  async function loadRequests() {
    try {
      setLoading(true)
      setError(null)
      const data = await listProviderAllRequests()
      setRequests(data)
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des demandes")
    } finally {
      setLoading(false)
    }
  }

  function filterRequests() {
    if (activeFilter === "all") {
      setFilteredRequests(requests)
    } else {
      setFilteredRequests(requests.filter(request => request.status === activeFilter))
    }
  }

  function handleFilterChange(filter: FilterStatus) {
    setActiveFilter(filter)
  }

  const filterCounts = {
    all: requests.length,
    open: requests.filter(r => r.status === "open").length,
    pending: requests.filter(r => r.status === "pending").length,
    accepted: requests.filter(r => r.status === "accepted").length,
    completed: requests.filter(r => r.status === "completed").length,
    closed: requests.filter(r => r.status === "closed").length,
  }

  return (
    <section aria-labelledby="provider-requests-heading" className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Découvrez les</p>
            <h1 id="provider-requests-heading" className="text-xl font-semibold text-gray-900">
              Demandes de service
            </h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={activeFilter === "all"}
          count={filterCounts.all}
          label="Toutes"
          onClick={() => handleFilterChange("all")}
        />
        <FilterButton
          active={activeFilter === "open"}
          count={filterCounts.open}
          label="Ouvertes"
          onClick={() => handleFilterChange("open")}
        />
        <FilterButton
          active={activeFilter === "pending"}
          count={filterCounts.pending}
          label="En attente"
          onClick={() => handleFilterChange("pending")}
        />
        <FilterButton
          active={activeFilter === "accepted"}
          count={filterCounts.accepted}
          label="Acceptées"
          onClick={() => handleFilterChange("accepted")}
        />
        <FilterButton
          active={activeFilter === "completed"}
          count={filterCounts.completed}
          label="Terminées"
          onClick={() => handleFilterChange("completed")}
        />
        <FilterButton
          active={activeFilter === "closed"}
          count={filterCounts.closed}
          label="Fermées"
          onClick={() => handleFilterChange("closed")}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadRequests}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Aucune demande trouvée
          </h3>
          <p className="text-sm text-gray-500">
            {activeFilter === "all"
              ? "Il n'y a pas encore de demandes de service."
              : `Aucune demande avec le statut "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <RequestCard key={request._id} request={request} onRefresh={loadRequests} />
          ))}
        </div>
      )}
    </section>
  )
}

interface FilterButtonProps {
  active: boolean
  count: number
  label: string
  onClick: () => void
}

function FilterButton({ active, count, label, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active
          ? "bg-primary-600 text-white shadow-sm"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 ${active ? "text-primary-100" : "text-gray-500"}`}>
          ({count})
        </span>
      )}
    </button>
  )
}
