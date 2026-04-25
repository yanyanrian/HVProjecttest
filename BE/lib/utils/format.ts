import type { Agent, AgentLeaderboardEntry } from "@/types/agent";

export function formatAUM(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount}`;
}

export function formatReturn(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function toLeaderboardEntry(
  agent: Agent,
  rank: number
): AgentLeaderboardEntry {
  return {
    rank,
    id: agent.id,
    name: agent.name,
    strategy: agent.strategy,
    return_30d: agent.return_30d,
    return_30d_formatted: formatReturn(agent.return_30d),
    sharpe_ratio: agent.sharpe_ratio,
    total_aum: agent.total_aum,
    total_aum_formatted: formatAUM(agent.total_aum),
    win_rate: agent.win_rate,
    status: agent.status,
  };
}