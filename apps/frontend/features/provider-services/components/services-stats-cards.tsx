"use client"

import React from 'react'
import { TrendingUp, Eye, MessageCircle, Briefcase } from 'lucide-react'
import type { ProviderStats } from '@/features/provider-services/services/provider-services-api'

interface ServicesStatsCardsProps {
  stats: ProviderStats
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  bgColor: string
  iconColor: string
}

function StatCard({ icon, label, value, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${bgColor} p-3 rounded-lg`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function ServicesStatsCards({ stats }: ServicesStatsCardsProps) {
  // Calculate total stats
  const totalViews = stats?.byStatus
    ? Object.values(stats.byStatus).reduce((sum, s) => sum + (s.totalViews || 0), 0)
    : 0
  const totalInquiries = stats?.byStatus
    ? Object.values(stats.byStatus).reduce((sum, s) => sum + (s.totalInquiries || 0), 0)
    : 0
  const activeCount = stats?.byStatus?.active?.count || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Briefcase className="h-5 w-5" />}
        label="Total Services"
        value={stats.total}
        bgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Services Actifs"
        value={activeCount}
        bgColor="bg-green-100"
        iconColor="text-green-600"
      />
      <StatCard
        icon={<Eye className="h-5 w-5" />}
        label="Total Vues"
        value={totalViews}
        bgColor="bg-purple-100"
        iconColor="text-purple-600"
      />
      <StatCard
        icon={<MessageCircle className="h-5 w-5" />}
        label="Demandes"
        value={totalInquiries}
        bgColor="bg-amber-100"
        iconColor="text-amber-600"
      />
    </div>
  )
}
