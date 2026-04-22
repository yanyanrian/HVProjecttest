import { AppShell } from "@/components/app-shell"
import { AgentCard } from "@/components/dashboard/agent-card"
import { YieldOpportunities } from "@/components/dashboard/yield-opportunities"
import { EquityChart } from "@/components/equity-chart"
import { DASHBOARD_AGENTS, MOCK_AGENTS } from "@/lib/mock-data"

export default function YieldAgentPage() {
  const agent = DASHBOARD_AGENTS.find((a) => a.kind === "yield")!
  const curve = MOCK_AGENTS[2].priceHistory

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-5 md:gap-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Platform / Yield Agent
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Yield Agent
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-compounds stablecoin and blue-chip LP positions across Monad
            DEXs.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          <div className="lg:col-span-1">
            <AgentCard agent={agent} />
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              30-day Equity Curve
            </h2>
            <div className="mt-4">
              <EquityChart data={curve} positive />
            </div>
          </div>
        </section>

        <YieldOpportunities />
      </div>
    </AppShell>
  )
}
