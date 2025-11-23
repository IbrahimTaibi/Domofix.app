import React, { useMemo } from 'react'
import { ResponsivePie } from '@nivo/pie'
import type { OrdersStatusCount } from '../types'

const COLORS = ['#93C5FD', '#60A5FA', '#3B82F6', '#9CA3AF']

export default function OrdersStatusDonut({ data }: { data: OrdersStatusCount[] }) {
  const labelForStatus = (s: string) => {
    switch (s) {
      case 'in_progress':
        return 'En cours'
      case 'confirmed':
        return 'Confirmée'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      default:
        return s
    }
  }
  const series = useMemo(() => data.map((d) => ({ id: labelForStatus(String(d.status)), label: labelForStatus(String(d.status)), value: d.count })), [data])
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Statut des commandes</div>
      <div className="h-64">
        <ResponsivePie
          data={series}
          margin={{ top: 12, right: 80, bottom: 12, left: 80 }}
          innerRadius={0.55}
          padAngle={1}
          cornerRadius={3}
          colors={COLORS}
          animate={true}
          activeOuterRadiusOffset={4}
          enableArcLabels={true}
          arcLabelsSkipAngle={8}
          arcLabelsTextColor="#374151"
          theme={{ labels: { text: { fontSize: 11, fill: '#374151' } } }}
        />
      </div>
    </div>
  )
}
