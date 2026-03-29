// app/api/kuberaa/transactions/route.ts
// GET /api/kuberaa/transactions — Get transaction history for portfolio

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const ticker = searchParams.get("ticker");
    const type = searchParams.get("type"); // BUY | SELL
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    if (!userId) {
      return NextResponse.json({ error: "userId query param required." }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    const where: Record<string, unknown> = { portfolioId: portfolio.id };
    if (ticker) where.etfTicker = ticker;
    if (type && (type === "BUY" || type === "SELL")) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
      include: {
        etf: {
          select: { name: true, assetClass: true },
        },
      },
    });

    return NextResponse.json({
      transactions,
      count: transactions.length,
      portfolioId: portfolio.id,
    });
  } catch (err) {
    console.error("[transactions GET]", err);
    return NextResponse.json({ error: "Failed to fetch transactions." }, { status: 500 });
  }
}
