"use client"

import React from "react"
import { Package, PlayCircle, CheckCircle, XCircle } from "lucide-react"
import { OrderStatus } from "../services/orders-service"

interface OrdersFiltersProps {
  activeFilter: OrderStatus | "all"
  onFilterChange: (filter: OrderStatus | "all") => void
  orderCounts: {
    all: number
    assigned: number
    in_progress: number
    completed: number
    canceled: number
  }
}

const FILTER_CONFIG = [
  {
    key: "all" as const,
    label: "Toutes",
    icon: Package,
    color: "gray",
  },
  {
    key: "assigned" as const,
    label: "Assignées",
    icon: Package,
    color: "blue",
  },
  {
    key: "in_progress" as const,
    label: "En cours",
    icon: PlayCircle,
    color: "amber",
  },
  {
    key: "completed" as const,
    label: "Terminées",
    icon: CheckCircle,
    color: "green",
  },
  {
    key: "canceled" as const,
    label: "Annulées",
    icon: XCircle,
    color: "red",
  },
]

const COLOR_CLASSES = {
  gray: {
    active: "bg-gray-600 text-white",
    inactive: "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200",
  },
  blue: {
    active: "bg-blue-600 text-white",
    inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
  },
  amber: {
    active: "bg-amber-600 text-white",
    inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  },
  green: {
    active: "bg-green-600 text-white",
    inactive: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200",
  },
  red: {
    active: "bg-red-600 text-white",
    inactive: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  },
}

export default function OrdersFilters({ activeFilter, onFilterChange, orderCounts }: OrdersFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {FILTER_CONFIG.map((filter) => {
        const isActive = activeFilter === filter.key
        const Icon = filter.icon
        const count = orderCounts[filter.key]
        const colorClasses = COLOR_CLASSES[filter.color]

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              isActive ? colorClasses.active : colorClasses.inactive
            }`}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{filter.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive ? "bg-white/20" : "bg-gray-100"
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
