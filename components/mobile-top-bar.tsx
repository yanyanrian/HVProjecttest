"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  LayoutGrid,
  LineChart,
  Menu,
  MessagesSquare,
  Sparkles,
  Trophy,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatUsd } from "@/lib/format"
import { PORTFOLIO_SUMMARY } from "@/lib/mock-data"

const ITEMS = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Agent Chat", href: "/agent-chat", icon: MessagesSquare },
  { label: "FX Agent", href: "/fx-agent", icon: LineChart },
  { label: "Yield Agent", href: "/yield-agent", icon: Sparkles },
  { label: "Swap", href: "/swap", icon: ArrowLeftRight },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
]

export function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="size-7 rounded-md bg-primary/15 text-primary grid place-items-center"
            aria-hidden="true"
          >
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Hypervault</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </div>
            <div className="text-sm font-semibold">
              ${formatUsd(PORTFOLIO_SUMMARY.totalUsd)}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <nav className="px-3 pb-3" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                      active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-foreground/80 hover:bg-secondary/60",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
