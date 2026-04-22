import { ArrowDownToLine, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUsd } from "@/lib/format"
import { PORTFOLIO_SUMMARY } from "@/lib/mock-data"

export function BalanceHeader() {
  return (
    <section
      aria-labelledby="total-balance-heading"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <h2
            id="total-balance-heading"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Total Portfolio Balance
          </h2>
          <p className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            ${formatUsd(PORTFOLIO_SUMMARY.totalUsd)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              FX:{" "}
              <span className="text-foreground/90">
                ${formatUsd(PORTFOLIO_SUMMARY.fxUsd)}
              </span>
            </span>
            <span>
              Yield:{" "}
              <span className="text-foreground/90">
                ${formatUsd(PORTFOLIO_SUMMARY.yieldUsd)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5">
            <ArrowDownToLine className="size-4" aria-hidden="true" />
            Receive Funds
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Send className="size-4" aria-hidden="true" />
            Send
          </Button>
        </div>
      </div>
    </section>
  )
}
