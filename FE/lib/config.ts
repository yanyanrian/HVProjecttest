export const SWAP_TOKENS = [
  "USDC",
  "MON",
  "WMON",
  "USDGLO",
  "stMON",
] as const

export type SwapToken = (typeof SWAP_TOKENS)[number]
