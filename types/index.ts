/**
 * Shared types for Hypervault.
 * Shapes mirror the on-chain structs from AgentRegistry.sol and DelegationVault.sol.
 * We use `bigint` for on-chain values and `number` for off-chain seed/display values.
 */

/** Matches AgentInfo struct from AgentRegistry.sol */
export interface Agent {
  agentId: bigint
  owner: `0x${string}`
  name: string
  strategy: string
  tradingThesis: string
  feePercent: bigint // basis points, divide by 100 for %
  registeredAt: bigint // unix timestamp
  totalTrades: bigint
  reputationScore: bigint
  isActive: boolean
}

/** Off-chain performance stats seeded by backend */
export interface AgentStats {
  agentId: number
  returnPct30d: number // e.g. 12.4 = +12.4%
  sharpeRatio: number
  maxDrawdown: number
  winRate: number // 0-100
  totalAumUsdc: number // human-readable USDC
  priceHistory: PricePoint[]
}

export interface PricePoint {
  timestamp: number
  value: number // index starting at 100
}

/** Merged view used by leaderboard and profile pages */
export interface AgentViewModel extends Agent, AgentStats {}

/** Delegator position from DelegationVault */
export interface Position {
  agentId: bigint
  principal: bigint
  pendingRewards: bigint
  depositedAt: bigint
}

/** Pool summary for an agent */
export interface AgentPool {
  totalPrincipal: bigint
  totalDistributed: bigint
  operatorRewards: bigint
}

/** Dashboard-specific types (the Overview page) */
export type AgentKind = "fx" | "yield"

export interface OnchainAgent {
  id: string
  kind: AgentKind
  name: string
  isActive: boolean
  nextRunLabel: string // e.g. "23:00" or "05:37"
  balanceUsd: number
  pnl24hUsd: number | null
  pnl24hPct: number | null
  identity: `0x${string}`
  humanBacked: boolean
  identityVerified: boolean
  positions: AgentPosition[]
}

export interface AgentPosition {
  symbol: string
  amountUsd: number
  subLabel?: string // e.g. "Aa 07:00", "Ask 0.42100", "kl: $42.10"
}

export interface FxSignal {
  id: string
  symbol: string // e.g. "XAUT"
  price: string // formatted price string
  sentiment: "positive" | "negative" | "neutral"
  sentimentLabel: string // e.g. "NEGATIVE/HOLD"
  title: string
  description: string
  icon?: string
}

export interface YieldOpportunity {
  id: string
  rank: number
  title: string
  protocol: string
  aprPct: number
  tvlUsd: number
  icon?: string
}
