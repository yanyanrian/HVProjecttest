import { NextRequest, NextResponse } from "next/server";
import { getPrice } from "@/lib/services/chainlinkMock";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair } = await params;
  const data = getPrice(pair.replace("-", "/").toUpperCase());

  if (!data) {
    return NextResponse.json(
      { success: false, error: `Price feed '${pair}' not found`,
        available: ["ETH-USD", "BTC-USD", "LINK-USD", "SOL-USD", "MATIC-USD"] },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
} 