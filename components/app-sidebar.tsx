"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  LayoutGrid,
  LineChart,
  MessagesSquare,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { formatUsd } from "@/lib/format"
import { PORTFOLIO_SUMMARY } from "@/lib/mock-data"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const PLATFORM_NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Agent Chat", href: "/agent-chat", icon: MessagesSquare },
  { label: "FX Agent", href: "/fx-agent", icon: LineChart },
  { label: "Yield Agent", href: "/yield-agent", icon: Sparkles },
  { label: "Swap", href: "/swap", icon: ArrowLeftRight },
]

const DISCOVER_NAV: NavItem[] = [
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      aria-label="Primary navigation"
    >
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <div
          className="size-7 rounded-md bg-primary/15 text-primary grid place-items-center"
          aria-hidden="true"
        >
          <Sparkles className="size-4" />
        </div>
        <span className="font-semibold tracking-tight">Hypervault</span>
      </div>

      <div className="px-4">
        <p className="px-1 pt-4 pb-2 text-xs font-medium text-muted-foreground">
          Portfolio
        </p>
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2">
            <div
              className="size-7 rounded-md bg-primary/15 text-primary grid place-items-center"
              aria-hidden="true"
            >
              <Wallet className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Total Balance
              </span>
              <span className="text-sm font-semibold">
                ${formatUsd(PORTFOLIO_SUMMARY.totalUsd)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="px-4 pt-6 flex-1 flex flex-col gap-6" aria-label="Platform">
        <NavSection label="Platform" items={PLATFORM_NAV} pathname={pathname} />
        <NavSection label="Discover" items={DISCOVER_NAV} pathname={pathname} />
      </nav>

      <div className="px-5 py-4 text-[11px] text-muted-foreground">
        <span className="font-mono">0x6004…aabbc</span>
      </div>
    </aside>
  )
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavItem[]
  pathname: string
}) {
  return (
    <div>
      <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
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
    </div>
  )
}
