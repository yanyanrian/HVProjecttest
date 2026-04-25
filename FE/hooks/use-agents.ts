"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAgents } from "@/lib/api"

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  })
}
