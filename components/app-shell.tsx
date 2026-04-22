import type React from "react"

import { TopNav } from "@/components/top-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
