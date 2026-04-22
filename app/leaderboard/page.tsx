import Link from "next/link"
import { Trophy } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Sparkline } from "@/components/sparkline"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatBps,
  formatCompactUsd,
  formatPct,
} from "@/lib/format"
import { MOCK_AGENTS } from "@/lib/mock-data"

export default function LeaderboardPage() {
  const sorted = [...MOCK_AGENTS].sort(
    (a, b) => b.returnPct30d - a.returnPct30d,
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center"
            aria-hidden="true"
          >
            <Trophy className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Agent Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover and rank AI trading agents on Monad Testnet.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Agent</div>
            <div className="col-span-2">30d Return</div>
            <div className="col-span-1">Sharpe</div>
            <div className="col-span-2">AUM</div>
            <div className="col-span-1">Fee</div>
            <div className="col-span-2 text-right">7d Trend</div>
          </div>

          <ul className="divide-y divide-border">
            {sorted.map((agent, idx) => {
              const positive = agent.returnPct30d >= 0
              return (
                <li key={agent.agentId.toString()}>
                  <Link
                    href={`/agent/${agent.agentId.toString()}`}
                    className="grid grid-cols-2 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="md:col-span-1 order-1 text-sm text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <div className="md:col-span-3 order-2 col-span-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{agent.name}</span>
                        {!agent.isActive ? (
                          <Badge variant="outline" className="text-[10px]">
                            Paused
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {agent.strategy}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "md:col-span-2 order-3 text-sm font-medium",
                        positive ? "text-primary" : "text-destructive",
                      )}
                    >
                      {formatPct(agent.returnPct30d)}
                    </div>
                    <div className="md:col-span-1 order-4 text-sm">
                      {agent.sharpeRatio.toFixed(1)}
                    </div>
                    <div className="md:col-span-2 order-5 text-sm">
                      {formatCompactUsd(agent.totalAumUsdc)}
                    </div>
                    <div className="md:col-span-1 order-6 text-sm text-muted-foreground">
                      {formatBps(agent.feePercent)}
                    </div>
                    <div className="md:col-span-2 order-7 col-span-2 flex justify-end">
                      <Sparkline
                        data={agent.priceHistory.slice(-7)}
                        positive={positive}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
