"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatBps, formatCompactUsd, formatPct } from "@/lib/format"
import { useAgents } from "@/hooks/use-agents"
import type { AgentViewModel } from "@/types"

type FilterKey = "all" | "active" | "top-sharpe"
type SortKey = "30d" | "sharpe" | "aum"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "top-sharpe", label: "Top Sharpe" },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: "30d", label: "30d Return" },
  { key: "sharpe", label: "Sharpe" },
  { key: "aum", label: "AUM" },
]

function applyFilter(
  agents: AgentViewModel[],
  filter: FilterKey,
): AgentViewModel[] {
  if (filter === "active") return agents.filter((a) => a.isActive)
  if (filter === "top-sharpe") {
    return [...agents]
      .sort((a, b) => b.sharpeRatio - a.sharpeRatio)
      .slice(0, 5)
  }
  return agents
}

function applySort(
  agents: AgentViewModel[],
  sort: SortKey,
): AgentViewModel[] {
  const sorted = [...agents]
  if (sort === "30d") sorted.sort((a, b) => b.returnPct30d - a.returnPct30d)
  if (sort === "sharpe") sorted.sort((a, b) => b.sharpeRatio - a.sharpeRatio)
  if (sort === "aum") sorted.sort((a, b) => b.totalAumUsdc - a.totalAumUsdc)
  return sorted
}

export function LeaderboardContent() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sort, setSort] = useState<SortKey>("30d")
  const { data: agents = [], isLoading } = useAgents()

  const rows = useMemo(
    () => applySort(applyFilter(agents, filter), sort),
    [agents, filter, sort],
  )

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading agents…
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter chips + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "h-9 rounded-full px-4 text-sm transition-colors border",
                  active
                    ? "border-primary/70 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border",
                )}
                aria-pressed={active}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[150px] rounded-md bg-secondary/40 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium py-3 pr-4 w-12">#</th>
              <th className="text-left font-medium py-3 pr-4">Agent</th>
              <th className="text-right font-medium py-3 px-4">30d</th>
              <th className="text-right font-medium py-3 px-4">Sharpe</th>
              <th className="text-right font-medium py-3 px-4 hidden sm:table-cell">
                AUM
              </th>
              <th className="text-right font-medium py-3 pl-4 w-20">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {rows.map((agent, idx) => {
              const positive = agent.returnPct30d >= 0
              return (
                <tr
                  key={agent.agentId.toString()}
                  className="group hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-5 pr-4 align-top text-muted-foreground tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-5 pr-4 align-top">
                    <Link
                      href={`/agent/${agent.agentId.toString()}`}
                      className="block"
                    >
                      <div className="font-semibold text-base group-hover:text-primary transition-colors">
                        {agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {agent.strategy}
                        {!agent.isActive ? " · Paused" : null}
                      </div>
                    </Link>
                  </td>
                  <td
                    className={cn(
                      "py-5 px-4 align-top text-right font-medium tabular-nums",
                      positive ? "text-primary" : "text-destructive",
                    )}
                  >
                    {formatPct(agent.returnPct30d)}
                  </td>
                  <td className="py-5 px-4 align-top text-right tabular-nums">
                    {agent.sharpeRatio.toFixed(2)}
                  </td>
                  <td className="py-5 px-4 align-top text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                    {formatCompactUsd(agent.totalAumUsdc)}
                  </td>
                  <td className="py-5 pl-4 align-top text-right tabular-nums text-muted-foreground">
                    {formatBps(agent.feePercent)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
