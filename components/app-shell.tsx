import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopBar } from "@/components/mobile-top-bar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
