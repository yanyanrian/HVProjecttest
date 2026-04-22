"use client"

import Link from "next/link"
import {
  BadgeCheck,
  LineChart,
  Play,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { formatUsd, formatUsdWithSign, formatPct, shortAddr } from "@/lib/format"
import type { OnchainAgent } from "@/types"

export function AgentCard({ agent }: { agent: OnchainAgent }) {
  const Icon = agent.kind === "fx" ? LineChart : Sprout
  const pnlPositive = (agent.pnl24hUsd ?? 0) > 0
  const pnlNegative = (agent.pnl24hUsd ?? 0) < 0
  const actionLabel = agent.kind === "fx" ? "Run Now" : "Harvest"

  return (
    <article className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center"
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">{agent.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  agent.isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    agent.isActive ? "bg-primary" : "bg-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                {agent.isActive ? "Active" : "Paused"}
              </span>
              <span aria-hidden="true">·</span>
              <span>Next: {agent.nextRunLabel}</span>
            </div>
          </div>
        </div>

        <Switch
          checked={agent.isActive}
          aria-label={`Toggle ${agent.name}`}
        />
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Balance" value={`$${formatUsd(agent.balanceUsd)}`} />
        <Stat
          label="24H P&L"
          value={
            agent.pnl24hUsd === null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <span
                className={cn(
                  pnlPositive && "text-primary",
                  pnlNegative && "text-destructive",
                )}
              >
                {formatUsdWithSign(agent.pnl24hUsd)}
                {agent.pnl24hPct !== null ? (
                  <span className="ml-1 text-sm font-medium">
                    {formatPct(agent.pnl24hPct)}
                  </span>
                ) : null}
              </span>
            )
          }
        />
        <Stat
          label="Identity"
          value={
            <span className="inline-flex items-center gap-1.5 font-mono text-sm">
              <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
              {shortAddr(agent.identity)}
            </span>
          }
          hint={agent.identityVerified ? "Verified" : undefined}
        />
        <Stat
          label="Human-Backed"
          value={
            <span className="inline-flex items-center gap-1.5 text-sm">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              Verify
            </span>
          }
        />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Positions
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {agent.positions.map((p) => (
            <li
              key={p.symbol}
              className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {p.symbol}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {p.subLabel}
                </span>
              </span>
              <span className="font-medium">${formatUsd(p.amountUsd)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link href={agent.kind === "fx" ? "/fx-agent" : "/yield-agent"}>
            View Dashboard
          </Link>
        </Button>
        <Button size="sm" className="flex-1 gap-1.5">
          {agent.kind === "fx" ? (
            <Play className="size-3.5" aria-hidden="true" />
          ) : (
            <Sparkles className="size-3.5" aria-hidden="true" />
          )}
          {actionLabel}
        </Button>
      </div>
    </article>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
