import { NextRequest, NextResponse } from "next/server";
import { agents } from "@/lib/data/agents";
import { formatAUM, formatReturn } from "@/lib/utils/format";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return NextResponse.json(
      { success: false, error: `Agent '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...agent,
      total_aum_formatted: formatAUM(agent.total_aum),
      return_30d_formatted: formatReturn(agent.return_30d),
    },
  });
}