"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import type { PricePoint } from "@/types"

export function Sparkline({
  data,
  positive = true,
  height = 36,
}: {
  data: PricePoint[]
  positive?: boolean
  height?: number
}) {
  return (
    <div style={{ width: 110, height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? "var(--color-chart-1)" : "var(--color-chart-3)"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
