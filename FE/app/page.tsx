import { AppShell } from "@/components/app-shell"
import { BalanceHeader } from "@/components/dashboard/balance-header"
import { AgentCard } from "@/components/dashboard/agent-card"
import { TrendingSignals } from "@/components/dashboard/trending-signals"
import { YieldOpportunities } from "@/components/dashboard/yield-opportunities"
import { fetchDashboardAgents } from "@/lib/api"

export default async function OverviewPage() {
  const slots = await fetchDashboardAgents()

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-5 md:gap-6">
        <BalanceHeader />

        <section
          aria-label="Active agents"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6"
        >
          {slots.map((slot) => (
            <AgentCard key={slot.id} agent={slot} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          <TrendingSignals />
          <YieldOpportunities />
        </section>
      </div>
    </AppShell>
  )
}
