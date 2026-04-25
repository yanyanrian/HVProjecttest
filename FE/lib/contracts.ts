/**
 * Deployed contract addresses on Monad Testnet (chainId 10143).
 * Source: SC/deployments/monad-testnet.json
 */
export const MONAD_TESTNET_CHAIN_ID = 10143

export const CONTRACT_ADDRESSES = {
  AgentRegistry: "0x68eD310267Eb81a1250B36A91B826D0973451461" as `0x${string}`,
  DelegationVault: "0x4B48792bf23F7c08265Eca82cED0c87258e0aCF5" as `0x${string}`,
  PlatformFee: "0x863D0583B733951aCDba7e7129Ac6d11Ae1E6868" as `0x${string}`,
  MockUSDC: "0x68c3fb5C43327ecB367664191D749c002Ad0Ce15" as `0x${string}`,
} as const
