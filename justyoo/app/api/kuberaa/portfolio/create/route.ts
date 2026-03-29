// app/api/kuberaa/portfolio/create/route.ts
// POST /api/kuberaa/portfolio/create — Create portfolio from confirmed ETF selection

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeInitialPortfolio } from "@/lib/trading/executor";
import {
  computePortfolioMetrics,
  loadCorrelationMatrix,
  HoldingInput,
} from "@/lib/portfolio/metrics";

export type CreatePortfolioBody = {
  userId: string;
  // Array of {ticker, absoluteWeight (0–1), currentPrice}
  holdings: {
    ticker: string;
    absoluteWeight: number;
    currentPrice: number;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const body: CreatePortfolioBody = await req.json();
    const { holdings } = body;
    
    // Get userId from middleware-injected header
    const userId = req.headers.get("x-user-id");

    if (!userId || !holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized or missing holdings." },
        { status: 400 }
      );
    }

    // Validate weights sum to ~1
    const totalWeight = holdings.reduce((sum, h) => sum + h.absoluteWeight, 0);
    if (Math.abs(totalWeight - 1) > 0.02) {
      return NextResponse.json(
        { error: `Holding weights must sum to 1. Got ${totalWeight.toFixed(4)}.` },
        { status: 400 }
      );
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Investor profile not found." }, { status: 404 });
    }

    // Check if user already has a portfolio
    const existing = await prisma.portfolio.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json(
        { error: "Portfolio already exists. Use trade endpoints to modify it." },
        { status: 409 }
      );
    }

    const capitalUSD = Number(profile.capitalUSD);

    // Create portfolio record
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        profileId: profile.id,
        virtualCash: capitalUSD,
        totalValue: capitalUSD,
        initialCapital: capitalUSD,
      },
    });

    // Execute all initial buy orders atomically
    const result = await executeInitialPortfolio(
      portfolio.id,
      capitalUSD,
      holdings.map((h) => ({
        etfTicker: h.ticker,
        targetWeight: h.absoluteWeight,
        currentPrice: h.currentPrice,
      }))
    );

    if (!result.success) {
      // Rollback portfolio creation
      await prisma.portfolio.delete({ where: { id: portfolio.id } });
      return NextResponse.json(
        { error: "Portfolio creation failed.", details: result.errors },
        { status: 500 }
      );
    }

    // Compute portfolio metrics
    const etfs = await prisma.eTF.findMany({
      where: { ticker: { in: holdings.map((h) => h.ticker) } },
    });
    const correlationMatrix = await loadCorrelationMatrix(prisma);

    const holdingInputs: HoldingInput[] = holdings.map((h) => {
      const etf = etfs.find((e) => e.ticker === h.ticker);
      return {
        ticker: h.ticker,
        weight: h.absoluteWeight,
        historicalAnnualReturn: Number(etf?.historicalAnnualReturn ?? 0),
        historicalVolatility: Number(etf?.historicalVolatility ?? 0),
      };
    });

    const metrics = computePortfolioMetrics(holdingInputs, correlationMatrix);

    // Fetch the created portfolio with holdings
    const createdPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: { holdings: true, transactions: true },
    });

    return NextResponse.json({
      success: true,
      portfolio: createdPortfolio,
      metrics,
    });
  } catch (err) {
    console.error("[portfolio/create POST]", err);
    return NextResponse.json({ error: "Failed to create portfolio." }, { status: 500 });
  }
}
