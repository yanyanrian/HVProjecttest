"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSwapQuote } from "@/lib/api"

export function useSwapQuote(from: string, to: string, amount: string) {
  return useQuery({
    queryKey: ["swap-quote", from, to],
    queryFn: () => fetchSwapQuote(from, to, amount),
    staleTime: 30_000,
  })
}
