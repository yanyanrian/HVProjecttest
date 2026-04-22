"use client"

import { useState } from "react"
import { ArrowDownUp, Settings2 } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TOKENS = ["USDC", "MON", "WMON", "CELO", "USDGLO", "stCELO"]

export default function SwapPage() {
  const [from, setFrom] = useState("USDC")
  const [to, setTo] = useState("MON")
  const [fromAmount, setFromAmount] = useState("100")

  return (
    <AppShell>
      <div className="mx-auto max-w-xl w-full px-4 md:px-8 py-6 md:py-12 flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Swap</h1>
          </div>
          <Button variant="outline" size="icon" aria-label="Swap settings">
            <Settings2 className="size-4" />
          </Button>
        </header>

        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
          <TokenRow
            label="You pay"
            token={from}
            onTokenChange={setFrom}
            amount={fromAmount}
            onAmountChange={setFromAmount}
            balance="5,420.00"
          />

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Flip tokens"
              onClick={() => {
                setFrom(to)
                setTo(from)
              }}
            >
              <ArrowDownUp className="size-4" />
            </Button>
          </div>

          <TokenRow
            label="You receive"
            token={to}
            onTokenChange={setTo}
            amount={((Number(fromAmount) || 0) * 48.2).toFixed(4)}
            readOnly
            balance="128.40"
          />

          <div className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>1 {from} ≈ 48.20 {to}</span>
            <span>Slippage 0.5%</span>
          </div>

          <Button size="lg" className="w-full">
            Review Swap
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Swaps route through the best Monad Testnet DEX available.
        </p>
      </div>
    </AppShell>
  )
}

function TokenRow({
  label,
  token,
  onTokenChange,
  amount,
  onAmountChange,
  balance,
  readOnly,
}: {
  label: string
  token: string
  onTokenChange: (v: string) => void
  amount: string
  onAmountChange?: (v: string) => void
  balance: string
  readOnly?: boolean
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>Balance: {balance}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          readOnly={readOnly}
          className="h-12 text-2xl border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
          aria-label={`${label} amount`}
        />
        <Select value={token} onValueChange={onTokenChange}>
          <SelectTrigger className="w-32 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOKENS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
