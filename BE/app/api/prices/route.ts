import { NextResponse } from "next/server";
import { getPrices } from "@/lib/services/chainlinkMock";

export async function GET() {
  const data = getPrices();
  return NextResponse.json({ success: true, ...data });
}