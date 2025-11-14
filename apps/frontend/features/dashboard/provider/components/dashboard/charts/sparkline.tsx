import React, { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import type { TimePoint } from '../types'

export default function Sparkline({ data }: { data: TimePoint[] }) {
  const series = useMemo(() => [{ id: 'trend', data: data.map(d => ({ x: d.date, y: d.value })) }], [data])
  return (
    <div className="h-10">
      <ResponsiveLine
        data={series}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        colors={["#3B82F6"]}
        lineWidth={1.5}
        enablePoints={false}
        enableArea={true}
        areaOpacity={0.2}
        isInteractive={false}
        animate={false}
      />
    </div>
  )
}
