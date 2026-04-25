import { NextRequest, NextResponse } from "next/server";
import { agents } from "@/lib/data/agents";
import { toLeaderboardEntry } from "@/lib/utils/format";
import type { Agent } from "@/types/agent";

const VALID_SORT_FIELDS: (keyof Agent)[] = ["return_30d", "sharpe_ratio", "total_aum", "win_rate"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sort = (searchParams.get("sort") ?? "return_30d") as keyof Agent;
  const order = searchParams.get("order") ?? "desc";
  const strategy = searchParams.get("strategy");

  let result = [...agents];

  if (strategy) {
    result = result.filter((a) => a.strategy.toLowerCase() === strategy.toLowerCase());
  }

  if (VALID_SORT_FIELDS.includes(sort)) {
    result.sort((a, b) => {
      const aVal = a[sort] as number;
      const bVal = b[sort] as number;
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  const data = result.map((agent, i) => toLeaderboardEntry(agent, i + 1));
  return NextResponse.json({ success: true, count: data.length, data });
}