import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiveEquityChart } from "@/components/live-equity-chart"
import { PositionPanel } from "@/components/agent/position-panel"
import { fetchAgent } from "@/lib/api"
import {
  formatBps,
  formatCompactUsd,
  formatPct,
  shortAddr,
} from "@/lib/format"
import { cn } from "@/lib/utils"

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await fetchAgent(id)
  if (!agent) notFound()

  const positive = agent.returnPct30d >= 0

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/leaderboard">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Leaderboard
            </Link>
          </Button>
          <Badge
            variant="outline"
            className={cn(
              agent.isActive
                ? "bg-primary/15 text-primary border-primary/20"
                : "bg-secondary",
            )}
          >
            {agent.isActive ? "Active" : "Paused"}
          </Badge>
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {agent.name}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {agent.tradingThesis}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Owner: {shortAddr(agent.owner)}
          </p>
        </header>

        <section
          aria-label="Agent performance"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
            <Stat label="30d Return">
              <span
                className={cn(
                  positive ? "text-primary" : "text-destructive",
                )}
              >
                {formatPct(agent.returnPct30d)}
              </span>
            </Stat>
            <Stat label="Sharpe Ratio">{agent.sharpeRatio.toFixed(2)}</Stat>
            <Stat label="Max Drawdown">
              <span className="text-destructive">
                {formatPct(agent.maxDrawdown)}
              </span>
            </Stat>
            <Stat label="Win Rate">{agent.winRate}%</Stat>
            <Stat label="Total Trades">
              {Number(agent.totalTrades).toLocaleString()}
            </Stat>
            <Stat label="AUM">{formatCompactUsd(agent.totalAumUsdc)}</Stat>
            <Stat label="Fee">{formatBps(agent.feePercent)}</Stat>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              30-day Equity Curve
            </h2>
            <div className="mt-4">
              <LiveEquityChart
                agentId={agent.agentId}
                seed={agent.priceHistory}
                positive={positive}
              />
            </div>
          </div>
        </section>

        {/* Position panel is a client component that reads from DelegationVault */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Your Position
          </h2>
          <PositionPanel agentId={agent.agentId} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reviews
            </h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Reviews will appear here once delegators submit feedback on-chain.
            Agent #{agent.agentId.toString()} · Reputation:{" "}
            {agent.reputationScore.toString()}
          </p>
        </section>
      </div>
    </AppShell>
  )
}

function Stat({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-lg font-semibold">{children}</div>
    </div>
  )
}
