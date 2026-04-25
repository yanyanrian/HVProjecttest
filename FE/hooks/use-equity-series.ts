"use client"

import { useEffect, useRef, useState } from "react"
import { usePool } from "@/hooks/use-vault"
import type { PricePoint } from "@/types"

/**
 * Keeps a time-series of synthetic "equity index" values that react to the
 * on-chain pool AUM (totalPrincipal). Deposits inflate demand; withdrawals
 * cut supply of capital in the pool. The resulting index moves roughly
 * proportional to relative AUM change (bounded, with small noise) so the
 * chart on an agent dashboard is never visually static while a user
 * interacts with deposit/withdraw.
 *
 * Storage: localStorage keyed by agentId so the curve survives navigation
 * and reloads during a demo session. Initial seed comes from the caller
 * (usually the BE-derived deterministic history) so the chart has shape
 * before the first pool change.
 */

const STORAGE_PREFIX = "hv:equity:"
const MAX_POINTS = 120
const TICK_MS = 5_000
// Sensitivity: how strongly a 1x relative AUM delta nudges the index.
const AUM_SENSITIVITY = 40
const NOISE_AMPLITUDE = 0.35

function storageKey(agentId: bigint) {
  return `${STORAGE_PREFIX}${agentId.toString()}`
}

function loadStored(agentId: bigint): PricePoint[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(storageKey(agentId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PricePoint[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function persist(agentId: bigint, points: PricePoint[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey(agentId), JSON.stringify(points))
  } catch {
    // quota errors are non-fatal
  }
}

export function useEquitySeries(
  agentId: bigint,
  seed: PricePoint[],
): PricePoint[] {
  const [points, setPoints] = useState<PricePoint[]>(() => {
    const stored = loadStored(agentId)
    return stored ?? seed
  })

  const { data: pool } = usePool(agentId)
  const lastAumRef = useRef<bigint | null>(null)

  // Apply AUM-driven step whenever pool.totalPrincipal changes
  // (triggered by deposit / withdraw tx confirmations invalidating the read).
  useEffect(() => {
    const aum = pool?.totalPrincipal
    if (aum === undefined) return

    const prev = lastAumRef.current
    lastAumRef.current = aum

    // First observation — just record baseline; don't move the chart.
    if (prev === null) return
    if (prev === aum) return

    setPoints((current) => {
      const last = current[current.length - 1]?.value ?? 100
      // Relative AUM delta (guard against divide-by-zero when pool was empty).
      const prevNum = Number(prev)
      const aumNum = Number(aum)
      const base = prevNum === 0 ? Math.max(aumNum, 1) : prevNum
      const relDelta = (aumNum - prevNum) / base
      const step = relDelta * AUM_SENSITIVITY
      const next = Math.max(1, last + step)
      const point: PricePoint = {
        timestamp: Math.floor(Date.now() / 1000),
        value: Number(next.toFixed(2)),
      }
      const appended = [...current, point].slice(-MAX_POINTS)
      persist(agentId, appended)
      return appended
    })
  }, [pool?.totalPrincipal, agentId])

  // Gentle tick so the chart is always "alive" (market noise) even when
  // nobody is depositing. Anchored on the latest value.
  useEffect(() => {
    const id = setInterval(() => {
      setPoints((current) => {
        const last = current[current.length - 1]
        if (!last) return current
        const noise = (Math.random() - 0.5) * NOISE_AMPLITUDE
        const next = Math.max(1, last.value + noise)
        const point: PricePoint = {
          timestamp: Math.floor(Date.now() / 1000),
          value: Number(next.toFixed(2)),
        }
        const appended = [...current, point].slice(-MAX_POINTS)
        persist(agentId, appended)
        return appended
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [agentId])

  return points
}
