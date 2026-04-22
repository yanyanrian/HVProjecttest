/**
 * Formatting helpers shared across the UI.
 * All USDC on-chain values are 6-decimal bigints; human-readable values stay as JS numbers.
 */

/** Format a 6-decimal USDC bigint for display with 2 decimals by default. */
export function formatUSDC(amount: bigint, decimals = 2): string {
  const divisor = 1_000_000n
  const whole = amount / divisor
  const frac = amount % divisor
  const value = Number(whole) + Number(frac) / 1_000_000
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format a plain number as a USD amount with commas and 2 decimals. */
export function formatUsd(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format a plain number as $X,XXX.XX with the dollar sign. */
export function formatUsdWithSign(n: number, decimals = 2): string {
  const sign = n < 0 ? "-" : ""
  return `${sign}$${formatUsd(Math.abs(n), decimals)}`
}

/** Format basis points as "X.X%". */
export function formatBps(bps: bigint): string {
  return `${(Number(bps) / 100).toFixed(1)}%`
}

/** Format a plain percentage number with + / - prefix. */
export function formatPct(n: number, decimals = 2): string {
  const sign = n > 0 ? "+" : n < 0 ? "" : ""
  return `${sign}${n.toFixed(decimals)}%`
}

/** Shorten an address for display. */
export function shortAddr(addr: string, head = 4, tail = 4): string {
  if (!addr) return ""
  return `${addr.slice(0, 2 + head)}…${addr.slice(-tail)}`
}

/** Compact TVL/AUM display: 1.2M, 345K, etc. */
export function formatCompactUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}
