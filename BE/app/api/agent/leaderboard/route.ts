import { NextResponse } from "next/server";
import { agents } from "@/lib/data/agents";
import { toLeaderboardEntry } from "@/lib/utils/format";

export async function GET() {
  const data = [...agents]
    .sort((a, b) => b.return_30d - a.return_30d)
    .map((agent, i) => toLeaderboardEntry(agent, i + 1));

  return NextResponse.json({
    success: true,
    updated_at: new Date().toISOString(),
    data,
  });
}