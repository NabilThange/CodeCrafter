// app/api/kuberaa/portfolio/route.ts
// GET /api/kuberaa/portfolio — Get portfolio with live values

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  computePortfolioMetrics,
  computeHoldingMetrics,
  computePortfolioTotals,
  loadCorrelationMatrix,
  HoldingInput,
} from "@/lib/portfolio/metrics";

export async function GET(req: NextRequest) {
  try {
    // Get userId from middleware-injected header
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        holdings: {
          include: { etf: true },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    // Calculate per-holding metrics
    const totalPortfolioValue =
      portfolio.holdings.reduce((sum, h) => sum + Number(h.currentValue), 0) +
      Number(portfolio.virtualCash);

    const enrichedHoldings = portfolio.holdings.map((h) => {
      const holdingMetrics = computeHoldingMetrics(
        Number(h.units),
        Number(h.currentPrice),
        Number(h.averagePurchasePrice),
        totalPortfolioValue
      );
      return {
        ...h,
        ...holdingMetrics,
        etf: h.etf,
      };
    });

    // Portfolio-level totals
    const totals = computePortfolioTotals(
      portfolio.holdings.map((h) => Number(h.currentValue)),
      Number(portfolio.virtualCash),
      Number(portfolio.initialCapital)
    );

    // Portfolio metrics (expected return, Sharpe, etc.)
    const correlationMatrix = await loadCorrelationMatrix(prisma);
    const holdingInputs: HoldingInput[] = portfolio.holdings.map((h) => ({
      ticker: h.etfTicker,
      weight: Number(h.currentValue) / (totalPortfolioValue || 1),
      historicalAnnualReturn: Number(h.etf.historicalAnnualReturn),
      historicalVolatility: Number(h.etf.historicalVolatility),
    }));

    const metrics =
      holdingInputs.length > 0
        ? computePortfolioMetrics(holdingInputs, correlationMatrix)
        : null;

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        holdings: enrichedHoldings,
      },
      totals,
      metrics,
    });
  } catch (err) {
    console.error("[portfolio GET]", err);
    return NextResponse.json({ error: "Failed to fetch portfolio." }, { status: 500 });
  }
}
