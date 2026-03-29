// app/api/kuberaa/portfolio/performance/route.ts
// GET /api/kuberaa/portfolio/performance — Historical performance via price snapshots

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const days = parseInt(searchParams.get("days") ?? "30", 10);

    if (!userId) {
      return NextResponse.json({ error: "userId query param required." }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: true },
    });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    const tickers = portfolio.holdings.map((h) => h.etfTicker);

    // Get price snapshots for the last N days
    const since = new Date();
    since.setDate(since.getDate() - days);

    const snapshots = await prisma.priceSnapshot.findMany({
      where: {
        ticker: { in: tickers },
        takenAt: { gte: since },
      },
      orderBy: { takenAt: "asc" },
    });

    // Get transaction history to reconstruct portfolio value over time
    const transactions = await prisma.transaction.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { createdAt: "asc" },
    });

    // Group snapshots by date
    const dateMap = new Map<string, Record<string, number>>();
    for (const snap of snapshots) {
      const dateKey = snap.takenAt.toISOString().split("T")[0];
      if (!dateMap.has(dateKey)) dateMap.set(dateKey, {});
      dateMap.get(dateKey)![snap.ticker] = Number(snap.price);
    }

    // Build performance series
    const performanceSeries: { date: string; totalValue: number; gainLoss: number; returnPct: number }[] = [];

    for (const [date, prices] of Array.from(dateMap.entries())) {
      let dayTotal = 0;
      for (const holding of portfolio.holdings) {
        const price = prices[holding.etfTicker];
        if (price !== undefined) {
          dayTotal += Number(holding.units) * price;
        } else {
          dayTotal += Number(holding.currentValue);
        }
      }
      dayTotal += Number(portfolio.virtualCash);

      const initialCapital = Number(portfolio.initialCapital);
      const gainLoss = dayTotal - initialCapital;
      const returnPct = initialCapital === 0 ? 0 : gainLoss / initialCapital;

      performanceSeries.push({
        date,
        totalValue: Math.round(dayTotal * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        returnPct: Math.round(returnPct * 10000) / 10000,
      });
    }

    return NextResponse.json({
      portfolioId: portfolio.id,
      initialCapital: portfolio.initialCapital,
      performanceSeries,
      transactionCount: transactions.length,
    });
  } catch (err) {
    console.error("[portfolio/performance GET]", err);
    return NextResponse.json({ error: "Failed to fetch performance data." }, { status: 500 });
  }
}
