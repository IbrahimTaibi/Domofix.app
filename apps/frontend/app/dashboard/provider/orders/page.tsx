"use client"

import React, { useState, useEffect } from "react"
import { Package, AlertCircle } from "lucide-react"
import { listMyOrders, Order, OrderStatus } from "@/features/orders/services/orders-service"
import OrdersList from "@/features/orders/components/orders-list"
import OrdersFilters from "@/features/orders/components/orders-filters"
import { Spinner } from "@/shared/components/spinner"

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all")

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, activeFilter])

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)
      const data = await listMyOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }

  function filterOrders() {
    if (activeFilter === "all") {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeFilter))
    }
  }

  function handleFilterChange(filter: OrderStatus | "all") {
    setActiveFilter(filter)
  }

  return (
    <section aria-labelledby="provider-orders-heading" className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Gestion de vos</p>
            <h1 id="provider-orders-heading" className="text-xl font-semibold text-gray-900">
              Commandes
            </h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrdersFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        orderCounts={{
          all: orders.length,
          assigned: orders.filter(o => o.status === "assigned").length,
          in_progress: orders.filter(o => o.status === "in_progress").length,
          completed: orders.filter(o => o.status === "completed").length,
          canceled: orders.filter(o => o.status === "canceled").length,
        }}
      />

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
                onClick={loadOrders}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Aucune commande trouvée
          </h3>
          <p className="text-sm text-gray-500">
            {activeFilter === "all"
              ? "Vous n'avez pas encore de commandes."
              : `Aucune commande avec le statut "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <OrdersList orders={filteredOrders} onRefresh={loadOrders} />
      )}
    </section>
  )
}
