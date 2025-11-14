import React, { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import type { RequestsCategoryCount } from '../types'

export default function RequestsCategoryBar({ data }: { data: RequestsCategoryCount[] }) {
  const series = useMemo(() => data.map(d => ({ category: String(d.category), value: d.count })), [data])
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Demandes par catégorie</div>
      <div className="h-64">
        <ResponsiveBar
          data={series}
          keys={["value"]}
          indexBy="category"
          margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
          padding={0.3}
          colors={["#60A5FA"]}
          axisTop={null}
          axisRight={null}
          axisBottom={{ tickSize: 0, tickPadding: 8, tickRotation: 0 }}
          axisLeft={{ tickSize: 0, tickPadding: 8 }}
          animate={true}
          enableLabel={false}
        />
      </div>
    </div>
  )
}
