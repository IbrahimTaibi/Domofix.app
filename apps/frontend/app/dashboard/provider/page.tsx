"use client"

import React, { useMemo } from "react"
import { ClipboardList, TrendingUp, ClipboardCheck, CheckCircle, Gauge } from "lucide-react"
import KPICards from "@/features/dashboard/provider/components/dashboard/kpi-cards"
import RevenueBars from "@/features/dashboard/provider/components/dashboard/charts/revenue-bars"
import OrdersStatusDonut from "@/features/dashboard/provider/components/dashboard/charts/orders-status-donut"
import RequestsCategoryBar from "@/features/dashboard/provider/components/dashboard/charts/requests-category-bar"
import RecentActivity from "@/features/dashboard/provider/components/dashboard/activity/recent-activity"
import TopServices from "@/features/dashboard/provider/components/dashboard/tables/top-services"
import { makeKPIs, makeRevenueSeries, makeOrdersStatus, makeRequestsByCategory, makeRecentActivity, makeTopServices } from "@/features/dashboard/provider/components/dashboard/mock"

export default function ProviderDashboardPage() {
  const rev = useMemo(() => makeRevenueSeries(30), [])
  const kpis = useMemo(() => makeKPIs().map((k, idx) => ({
    ...k,
    icon: idx === 0 ? <TrendingUp className="w-4 h-4 text-primary-700" />
      : idx === 1 ? <ClipboardCheck className="w-4 h-4 text-primary-700" />
      : idx === 2 ? <CheckCircle className="w-4 h-4 text-primary-700" />
      : <Gauge className="w-4 h-4 text-primary-700" />,
    series: idx === 0 ? rev : undefined
  })), [rev])
  const orders = useMemo(() => makeOrdersStatus(), [])
  const reqCats = useMemo(() => makeRequestsByCategory(), [])
  const activity = useMemo(() => makeRecentActivity(), [])
  const top = useMemo(() => makeTopServices(), [])
  return (
    <section aria-labelledby="provider-dashboard-heading">
      <h1 id="provider-dashboard-heading" className="sr-only">Tableau de bord prestataire</h1>

      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Bienvenue sur votre</p>
            <h2 className="text-xl font-semibold text-gray-900">Tableau de bord prestataire</h2>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <KPICards items={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueBars data={rev} />
          </div>
          <div>
            <OrdersStatusDonut data={orders} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RequestsCategoryBar data={reqCats} />
          </div>
          <div>
            <RecentActivity items={activity} />
          </div>
        </div>

        <TopServices rows={top} />
      </div>
    </section>
  )
}
