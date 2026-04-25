/**
 * Async data layer.
 *
 * Priority order for agents:
 *   1. BE REST API  (proxied via /api/be — see next.config.mjs rewrites)
 *   2. Local mock data (fallback when BE is unavailable)
 *
 * The proxy keeps BE URL server-side (BE_URL env var) and avoids CORS.
 * On-chain reads (positions, pool state) are handled by wagmi hooks in
 * hooks/use-vault.ts and hooks/use-registry.ts — not here.
 */
import type {
  AgentViewModel,
  AgentStats,
  DashboardAgentSlot,
  FxSignal,
  NewsArticle,
  PricePoint,
  YieldOpportunity,
} from "@/types"
import {
  MOCK_AGENTS,
  DASHBOARD_AGENT_SLOTS,
  FX_SIGNALS,
  YIELD_OPPORTUNITIES,
} from "./mock-data"
import { NEWS_ARTICLES } from "./news-data"

export interface SwapQuote {
  rate: number
  slippagePct: number
}

/**
 * Server-side: call BE directly (no CORS, process.env available).
 * Client-side: use the rewrite proxy /api/be (same-origin, avoids CORS).
 */
const BE_PREFIX =
  typeof window === "undefined"
    ? `${process.env.BE_URL ?? "http://localhost:3001"}/api`
    : "/api/be"

/** Generate a deterministic 30-day equity curve (used when BE has no priceHistory). */
function generatePriceHistory(
  seed: number,
  volatility = 1.2,
  drift = 0.3,
): PricePoint[] {
  const points: PricePoint[] = []
  const now = Math.floor(Date.now() / 1000)
  let value = 100
  for (let i = 29; i >= 0; i--) {
    const r = Math.sin(seed * (i + 1)) * 10000
    const noise = (r - Math.floor(r) - 0.5) * volatility
    value = Math.max(50, value + drift + noise)
    points.push({ timestamp: now - i * 86400, value: Number(value.toFixed(2)) })
  }
  return points
}

/**
 * Maps a BE agent entry to the FE AgentStats shape.
 * BE uses snake_case; FE uses camelCase.
 */
function mapBeAgentToStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  index: number,
): AgentStats {
  return {
    agentId: BigInt(index + 1),
    returnPct30d: raw.return_30d ?? 0,
    sharpeRatio: raw.sharpe_ratio ?? 0,
    maxDrawdown: raw.max_drawdown ?? 0,
    winRate: raw.win_rate ?? 0,
    totalAumUsdc: raw.total_aum ?? 0,
    priceHistory: generatePriceHistory(index + 1, 1.2, (raw.return_30d ?? 0) * 0.03),
  }
}

/**
 * Fetch all agents, preferring the BE API and falling back to mock data.
 * The on-chain `Agent` fields come from the mock seed until a wallet is
 * connected and the registry hook provides live data.
 */
export async function fetchAgents(): Promise<AgentViewModel[]> {
  try {
    const res = await fetch(`${BE_PREFIX}/agent`, { next: { revalidate: 30 } })
    if (!res.ok) return MOCK_AGENTS

    const json = await res.json()
    const beAgents: unknown[] = json.data ?? []
    if (!Array.isArray(beAgents) || beAgents.length === 0) return MOCK_AGENTS

    // Merge BE stats with mock on-chain data (1-to-1 by position order).
    return beAgents.map((raw, i) => {
      const stats = mapBeAgentToStats(raw, i)
      // Use the matching mock agent for on-chain fields if available, else
      // fall back to the first mock agent shape.
      const base = MOCK_AGENTS[i] ?? MOCK_AGENTS[0]
      return { ...base, ...stats }
    })
  } catch {
    return MOCK_AGENTS
  }
}

export async function fetchAgent(
  id: string,
): Promise<AgentViewModel | undefined> {
  const all = await fetchAgents()
  return all.find((a) => a.agentId.toString() === id)
}

export async function fetchDashboardAgents(): Promise<DashboardAgentSlot[]> {
  return DASHBOARD_AGENT_SLOTS
}

export async function fetchFxSignals(): Promise<FxSignal[]> {
  return FX_SIGNALS
}

export async function fetchYieldOpportunities(): Promise<YieldOpportunity[]> {
  return YIELD_OPPORTUNITIES
}

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  return NEWS_ARTICLES
}

export async function fetchNewsArticle(
  slug: string,
): Promise<NewsArticle | undefined> {
  return NEWS_ARTICLES.find((a) => a.slug === slug)
}

export async function fetchRelatedNews(
  slug: string,
  category: string,
  limit = 3,
): Promise<NewsArticle[]> {
  return NEWS_ARTICLES.filter(
    (a) => a.slug !== slug && a.category === category,
  ).slice(0, limit)
}

/**
 * Fetch live token prices from BE.
 * Falls back to null when BE is unavailable.
 */
export async function fetchPrices(): Promise<Record<
  string,
  { pair: string; price: number; decimals: number; updated_at: string }
> | null> {
  try {
    const res = await fetch(`${BE_PREFIX}/prices`, { next: { revalidate: 10 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.prices ?? null
  } catch {
    return null
  }
}

// TODO: Replace with real DEX quote (e.g. 0x API, OKX DEX, or on-chain router)
export async function fetchSwapQuote(
  _from: string,
  _to: string,
  _amount: string,
): Promise<SwapQuote> {
  return { rate: 48.2, slippagePct: 0.5 }
}
