// app/api/kuberaa/etfs/route.ts
// GET /api/kuberaa/etfs — Get master ETF list

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeETFSelectionScore } from "@/lib/etf/selector";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetClass = searchParams.get("assetClass");
    const esgOnly = searchParams.get("esgOnly") === "true";

    const where: Record<string, unknown> = {};
    if (assetClass) where.assetClass = assetClass;
    if (esgOnly) where.esgEligible = true;

    const etfs = await prisma.eTF.findMany({
      where,
      orderBy: { ticker: "asc" },
    });

    // Add selection score to each ETF for display
    const etfsWithScore = etfs.map((etf: (typeof etfs)[number]) => ({
      ...etf,
      selectionScore: Math.round(computeETFSelectionScore(etf) * 10000) / 10000,
    }));

    return NextResponse.json(etfsWithScore);
  } catch (err) {
    console.error("[etfs GET]", err);
    return NextResponse.json({ error: "Failed to fetch ETFs." }, { status: 500 });
  }
}
