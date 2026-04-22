import { MessagesSquare, Send } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const MESSAGES = [
  {
    role: "agent" as const,
    name: "FX Agent",
    text: "Good morning. I'm watching EUR/USD consolidation into the CPI print. Want me to open a small probe long?",
    time: "09:14",
  },
  {
    role: "you" as const,
    name: "You",
    text: "Hold off until after the release. Risk cap still 1% of balance.",
    time: "09:15",
  },
  {
    role: "agent" as const,
    name: "Yield Agent",
    text: "Harvested 4.00% on USDC/CELO overnight. Rolling 30% of rewards into stCELO LP — expected APR 38.3%.",
    time: "09:18",
  },
]

export default function AgentChatPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-5 h-[calc(100vh-4rem)] lg:h-screen">
        <header className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center"
            aria-hidden="true"
          >
            <MessagesSquare className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Agent Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Give instructions and hear back from your agents in natural
              language.
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card p-5 overflow-y-auto">
          <ul className="flex flex-col gap-4">
            {MESSAGES.map((m, i) => (
              <li
                key={i}
                className={
                  m.role === "you"
                    ? "flex flex-col items-end gap-1"
                    : "flex flex-col items-start gap-1"
                }
              >
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={
                    m.role === "you"
                      ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2 text-sm"
                      : "max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary/60 text-foreground px-4 py-2 text-sm"
                  }
                >
                  {m.text}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2"
          aria-label="Send a message to your agents"
        >
          <Input
            placeholder="Message your agents…"
            className="border-0 focus-visible:ring-0 bg-transparent"
          />
          <Button size="icon" type="submit" aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
