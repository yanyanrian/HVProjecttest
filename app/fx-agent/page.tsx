import { AppShell } from "@/components/app-shell"
import { AgentCard } from "@/components/dashboard/agent-card"
import { TrendingSignals } from "@/components/dashboard/trending-signals"
import { EquityChart } from "@/components/equity-chart"
import { DASHBOARD_AGENTS, MOCK_AGENTS } from "@/lib/mock-data"

export default function FxAgentPage() {
  const agent = DASHBOARD_AGENTS.find((a) => a.kind === "fx")!
  const curve = MOCK_AGENTS[0].priceHistory

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-5 md:gap-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Platform / FX Agent
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            FX Agent
          </h1>
          <p className="text-sm text-muted-foreground">
            Systematic momentum and carry trades across synthetic FX pairs.
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

        <TrendingSignals />
      </div>
    </AppShell>
  )
}
