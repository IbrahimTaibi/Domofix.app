import React, { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import type { TimePoint } from '../types'

export default function RevenueBars({ data }: { data: TimePoint[] }) {
  const series = useMemo(() => data.map(d => ({ date: d.date, value: d.value })), [data])
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Revenus (30 jours)</div>
      <div className="h-64">
        <ResponsiveBar
          data={series}
          keys={["value"]}
          indexBy="date"
          margin={{ top: 10, right: 12, bottom: 10, left: 40 }}
          padding={0.2}
          colors={["#4F46E5"]}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{ tickSize: 0, tickPadding: 8 }}
          enableLabel={false}
          valueFormat={(v) => `${v} DT`}
          animate={true}
          theme={{
            axis: { ticks: { text: { fill: '#6B7280', fontSize: 12 } } },
            tooltip: { container: { background: '#111827', color: '#fff', borderRadius: 6 } },
          }}
        />
      </div>
    </div>
  )
}
