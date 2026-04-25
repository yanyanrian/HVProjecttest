import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { fetchFxSignals } from "@/lib/api"

const SENTIMENT_STYLES: Record<string, string> = {
  positive: "bg-primary/15 text-primary border-primary/20",
  negative: "bg-destructive/15 text-destructive border-destructive/20",
  neutral: "bg-secondary text-secondary-foreground border-border",
}

export async function TrendingSignals() {
  const signals = await fetchFxSignals()

  return (
    <section
      aria-labelledby="trending-fx-heading"
      className="rounded-2xl border border-border bg-card p-5"
    >
      <header className="flex items-center gap-2 pb-4">
        <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2
          id="trending-fx-heading"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Trending FX Signals
        </h2>
      </header>

      <ul className="flex flex-col gap-3">
        {signals.map((signal) => {
          const SentimentIcon =
            signal.sentiment === "positive" ? TrendingUp : TrendingDown
          return (
            <li
              key={signal.id}
              className="rounded-xl border border-border/60 bg-secondary/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="size-8 rounded-md bg-background grid place-items-center font-mono text-[10px] shrink-0"
                    aria-hidden="true"
                  >
                    {signal.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{signal.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {signal.price}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-[10px] font-medium uppercase tracking-wider shrink-0",
                    SENTIMENT_STYLES[signal.sentiment],
                  )}
                >
                  <SentimentIcon className="size-3" aria-hidden="true" />
                  {signal.sentimentLabel}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-medium leading-snug text-pretty">
                {signal.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {signal.description}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
