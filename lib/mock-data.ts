/**
 * Mock seed data used until the Monad Testnet contracts are wired in.
 * Shapes exactly match `types/index.ts` so swapping to live reads is a one-line change.
 */

import type {
  AgentViewModel,
  FxSignal,
  OnchainAgent,
  PricePoint,
  YieldOpportunity,
} from "@/types"

/** Generate a synthetic 30-day equity curve starting at 100. */
function generatePriceHistory(
  seed: number,
  volatility = 1.2,
  drift = 0.3,
): PricePoint[] {
  const points: PricePoint[] = []
  const now = Math.floor(Date.now() / 1000)
  let value = 100
  for (let i = 29; i >= 0; i--) {
    // deterministic pseudo-random
    const r = Math.sin(seed * (i + 1)) * 10000
    const noise = (r - Math.floor(r) - 0.5) * volatility
    value = Math.max(50, value + drift + noise)
    points.push({
      timestamp: now - i * 86400,
      value: Number(value.toFixed(2)),
    })
  }
  return points
}

export const MOCK_AGENTS: AgentViewModel[] = [
  {
    agentId: 1n,
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    name: "AlphaBot",
    strategy: "Momentum",
    tradingThesis:
      "Ride short-term momentum shifts on USDC/WMON breakouts with tight stops.",
    feePercent: 1000n,
    registeredAt: 1_700_000_000n,
    totalTrades: 847n,
    reputationScore: 92n,
    isActive: true,
    returnPct30d: 18.2,
    sharpeRatio: 2.4,
    maxDrawdown: -4.8,
    winRate: 68,
    totalAumUsdc: 120_450,
    priceHistory: generatePriceHistory(1, 1.4, 0.6),
  },
  {
    agentId: 2n,
    owner: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "BetaBot",
    strategy: "Mean Reversion",
    tradingThesis:
      "Fade extreme moves back to the 20-day average on majors.",
    feePercent: 500n,
    registeredAt: 1_700_500_000n,
    totalTrades: 612n,
    reputationScore: 81n,
    isActive: true,
    returnPct30d: 12.1,
    sharpeRatio: 1.9,
    maxDrawdown: -6.1,
    winRate: 63,
    totalAumUsdc: 85_200,
    priceHistory: generatePriceHistory(2, 0.9, 0.4),
  },
  {
    agentId: 3n,
    owner: "0x9876543210fedcba9876543210fedcba98765432",
    name: "Carbon Yield",
    strategy: "Liquidity Provider",
    tradingThesis:
      "Auto-compound CELO/USDGLO fees on Carbon DeFi with MEV protection.",
    feePercent: 800n,
    registeredAt: 1_701_000_000n,
    totalTrades: 1204n,
    reputationScore: 88n,
    isActive: true,
    returnPct30d: 9.6,
    sharpeRatio: 3.1,
    maxDrawdown: -2.4,
    winRate: 74,
    totalAumUsdc: 204_800,
    priceHistory: generatePriceHistory(3, 0.6, 0.3),
  },
  {
    agentId: 4n,
    owner: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    name: "DeltaHedger",
    strategy: "Delta Neutral",
    tradingThesis:
      "Pair perp shorts against spot longs to harvest funding.",
    feePercent: 1500n,
    registeredAt: 1_701_500_000n,
    totalTrades: 421n,
    reputationScore: 77n,
    isActive: true,
    returnPct30d: 7.4,
    sharpeRatio: 2.7,
    maxDrawdown: -3.2,
    winRate: 71,
    totalAumUsdc: 52_100,
    priceHistory: generatePriceHistory(4, 0.5, 0.25),
  },
  {
    agentId: 5n,
    owner: "0xfeedfacefeedfacefeedfacefeedfacefeedface",
    name: "EchoScalp",
    strategy: "Market Making",
    tradingThesis:
      "Provide two-sided liquidity on low-volatility pairs.",
    feePercent: 300n,
    registeredAt: 1_702_000_000n,
    totalTrades: 3102n,
    reputationScore: 69n,
    isActive: false,
    returnPct30d: -1.4,
    sharpeRatio: 0.8,
    maxDrawdown: -8.9,
    winRate: 55,
    totalAumUsdc: 18_300,
    priceHistory: generatePriceHistory(5, 1.8, -0.05),
  },
]

/* ---------------- Dashboard / Overview mock data ---------------- */

export const DASHBOARD_AGENTS: OnchainAgent[] = [
  {
    id: "fx-agent",
    kind: "fx",
    name: "FX Agent",
    isActive: true,
    nextRunLabel: "23:00",
    balanceUsd: 99.48,
    pnl24hUsd: null,
    pnl24hPct: null,
    identity: "0x6004a45d2a9e4c3b11a2f8c1d3e4f50099aaabbc",
    humanBacked: true,
    identityVerified: true,
    positions: [
      { symbol: "USDm", amountUsd: 13.47, subLabel: "Aa: 07:00" },
      { symbol: "EURm", amountUsd: 15.03, subLabel: "Ask: $17.64" },
      { symbol: "JPYm", amountUsd: 12.98, subLabel: "Bid: $7.30" },
    ],
  },
  {
    id: "yield-agent",
    kind: "yield",
    name: "Yield Agent",
    isActive: true,
    nextRunLabel: "05:37",
    balanceUsd: 165.16,
    pnl24hUsd: 6.6,
    pnl24hPct: 4.0,
    identity: "0x6104a45d2a9e4c3b11a2f8c1d3e4f50099abcdee",
    humanBacked: true,
    identityVerified: true,
    positions: [
      { symbol: "USDC", amountUsd: 29.95, subLabel: "Apr: $42.10" },
      { symbol: "CELO", amountUsd: 42.30, subLabel: "Apr: $42.10" },
    ],
  },
]

export const FX_SIGNALS: FxSignal[] = [
  {
    id: "xaut",
    symbol: "XAUT",
    price: "$4,191.18",
    sentiment: "negative",
    sentimentLabel: "NEGATIVE/HOLD",
    title: "Gold forecast: XAU/USD starts the week on a negative note",
    description:
      "Gold forecast: XAU/USD starts the week on a negative note against rising real yields.",
  },
  {
    id: "jpym",
    symbol: "JPYm",
    price: "$0.0064",
    sentiment: "positive",
    sentimentLabel: "POSITIVE/HOLD",
    title: "USD/JPY Forecast Today 17/02 US Dollar Continues",
    description:
      "USD/JPY Forecast Today 17/02 US Dollar Continues to push higher ahead of CPI.",
  },
  {
    id: "zarm",
    symbol: "ZARm",
    price: "$0.054",
    sentiment: "negative",
    sentimentLabel: "NEGATIVE/HOLD",
    title: "USD/ZAR keeps pressure on the Rand",
    description:
      "Pending macro prints weigh on emerging-market FX heading into the week.",
  },
]

export const YIELD_OPPORTUNITIES: YieldOpportunity[] = [
  {
    id: "carbon-celo-usdglo",
    rank: 1,
    title: "Provide liquidity to CELO / USDGLO on Carbon DeFi",
    protocol: "Carbon DeFi",
    aprPct: 149.06,
    tvlUsd: 1_000_079,
  },
  {
    id: "steer-usdt-wbtc",
    rank: 2,
    title: "Provide liquidity to Steer USDT–WBTC vault",
    protocol: "Steer",
    aprPct: 118.6,
    tvlUsd: 34_605_420,
  },
  {
    id: "uniswap-celo-usdt",
    rank: 3,
    title: "Provide liquidity to Uniswap v4 CELO–USDT",
    protocol: "Uniswap",
    aprPct: 98.3,
    tvlUsd: 60_039_540,
  },
  {
    id: "steer-celo-stcelo",
    rank: 4,
    title: "Provide liquidity to Steer CELO–stCELO vault",
    protocol: "Steer",
    aprPct: 38.35,
    tvlUsd: 513_414_570,
  },
]

/* ---------------- Portfolio summary shown at the top ---------------- */

export const PORTFOLIO_SUMMARY = {
  totalUsd: 204.64,
  fxUsd: 99.48,
  yieldUsd: 105.16,
  address: "0x6004a45d2a9e4c3b11a2f8c1d3e4f50099aaabbc" as `0x${string}`,
}
