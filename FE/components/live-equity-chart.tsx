"use client"

import { EquityChart } from "@/components/equity-chart"
import { useEquitySeries } from "@/hooks/use-equity-series"
import type { PricePoint } from "@/types"

export function LiveEquityChart({
  agentId,
  seed,
  positive,
}: {
  agentId: bigint
  seed: PricePoint[]
  positive?: boolean
}) {
  const data = useEquitySeries(agentId, seed)
  const computedPositive =
    positive ?? (data.length > 1 ? data[data.length - 1].value >= data[0].value : true)
  return <EquityChart data={data} positive={computedPositive} />
}
