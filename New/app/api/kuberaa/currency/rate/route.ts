// app/api/kuberaa/currency/rate/route.ts
// GET /api/kuberaa/currency/rate — Get cached USD/INR exchange rate

import { NextRequest, NextResponse } from "next/server";
import { getUSDtoINRRate } from "@/lib/currency/converter";

export async function GET(_req: NextRequest) {
  try {
    const rate = await getUSDtoINRRate();
    return NextResponse.json(rate);
  } catch (err) {
    console.error("[currency/rate GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch exchange rate." },
      { status: 500 }
    );
  }
}
