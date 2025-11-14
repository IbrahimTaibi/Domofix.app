import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import type { TimePoint } from "../types";

export default function RevenueTrend({ data }: { data: TimePoint[] }) {
  const series = useMemo(
    () => [
      { id: "Revenus", data: data.map((d) => ({ x: d.date, y: d.value })) },
    ],
    [data],
  );
  const tickValues = useMemo(
    () => series[0].data.map((d) => d.x).filter((_, i) => i % 3 === 0),
    [series],
  );
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">
        Revenus (30 jours)
      </div>
      <div className="h-64">
        <ResponsiveLine
          data={series}
          margin={{ top: 10, right: 16, bottom: 56, left: 44 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", stacked: false, min: "auto", max: "auto" }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: -35,
            tickValues,
            format: (value: string) => value.slice(5), // MM-DD
          }}
          axisLeft={{ tickSize: 0, tickPadding: 8 }}
          enableGridX={false}
          enableGridY={false}
          colors={["#4F46E5"]}
          lineWidth={2}
          enablePoints={false}
          pointSize={0}
          enableArea={true}
          areaOpacity={0.2}
          curve="monotoneX"
          useMesh={true}
          layers={[
            "grid",
            "markers",
            "areas",
            "lines",
            "axes",
            "slices",
            "points",
            "mesh",
            "legends",
          ]}
        />
      </div>
    </div>
  );
}
