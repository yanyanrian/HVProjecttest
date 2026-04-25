import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCompactUsd } from "@/lib/format"
import { fetchYieldOpportunities } from "@/lib/api"

export async function YieldOpportunities() {
  const opportunities = await fetchYieldOpportunities()

  return (
    <section
      aria-labelledby="yield-opps-heading"
      className="rounded-2xl border border-border bg-card p-5"
    >
      <header className="flex items-center gap-2 pb-4">
        <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2
          id="yield-opps-heading"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Top Yield Opportunities
        </h2>
      </header>

      <ul className="flex flex-col gap-2">
        {opportunities.map((opp) => (
          <li
            key={opp.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3"
          >
            <div
              className="size-8 rounded-md bg-background grid place-items-center text-sm font-semibold text-muted-foreground shrink-0"
              aria-hidden="true"
            >
              {opp.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug text-pretty truncate">
                {opp.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {opp.protocol}
              </p>
            </div>
            <div className="text-right shrink-0">
              <Badge className="bg-primary/15 text-primary border-primary/20 font-semibold">
                {opp.aprPct.toFixed(2)}% APR
              </Badge>
              <p className="mt-1 text-[11px] text-muted-foreground">
                TVL: {formatCompactUsd(opp.tvlUsd)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
