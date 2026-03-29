// app/api/kuberaa/rebalance/check/route.ts
// GET /api/kuberaa/rebalance/check — Run rebalancing drift check

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  computeDrift,
  generateRebalancePlanWithPrices,
  validatePlan,
  needsRebalancing,
  HoldingSnapshot,
} from "@/lib/rebalance/engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query param required." }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: { include: { etf: true } } },
    });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    const threshold = Number(profile?.rebalanceThreshold ?? 0.05);

    // Build current portfolio value
    const totalPortfolioValue =
      portfolio.holdings.reduce((sum, h) => sum + Number(h.currentValue), 0) +
      Number(portfolio.virtualCash);

    // Build holding snapshots
    const snapshots: HoldingSnapshot[] = portfolio.holdings.map((h) => ({
      ticker: h.etfTicker,
      targetWeight: Number(h.targetWeight),
      currentWeight:
        totalPortfolioValue === 0 ? 0 : Number(h.currentValue) / totalPortfolioValue,
      currentValue: Number(h.currentValue),
      units: Number(h.units),
      currentPrice: Number(h.currentPrice),
    }));

    const driftResults = computeDrift(snapshots, threshold);
    const requiresRebalancing = needsRebalancing(snapshots, threshold);

    let plan = null;
    let validation = null;

    if (requiresRebalancing) {
      plan = generateRebalancePlanWithPrices(driftResults, snapshots, totalPortfolioValue);
      validation = validatePlan(plan, Number(portfolio.virtualCash));
    }

    return NextResponse.json({
      requiresRebalancing,
      threshold,
      totalPortfolioValue,
      drift: driftResults,
      plan,
      validation,
    });
  } catch (err) {
    console.error("[rebalance/check GET]", err);
    return NextResponse.json({ error: "Failed to run rebalancing check." }, { status: 500 });
  }
}
