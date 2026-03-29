// app/api/kuberaa/rebalance/approve/route.ts
// POST /api/kuberaa/rebalance/approve — Approve and execute a rebalancing plan

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeRebalancePlan } from "@/lib/trading/executor";
import { validatePlan } from "@/lib/rebalance/engine";
import type { RebalancePlan } from "@/lib/rebalance/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, plan }: { userId: string; plan: RebalancePlan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "userId and plan are required." }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    // Final validation before execution
    const validation = validatePlan(plan, Number(portfolio.virtualCash));
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Plan validation failed.", details: validation.errors },
        { status: 400 }
      );
    }

    // Log rebalancing plan as PENDING
    const log = await prisma.rebalancingLog.create({
      data: {
        portfolioId: portfolio.id,
        triggeredAt: new Date(),
        trades: plan.trades as object[],
        status: "PENDING",
      },
    });

    // Execute sells then buys
    const sells = plan.sellsFirst.map((t) => ({
      ticker: t.ticker,
      units: t.estimatedUnits,
      price: t.currentPrice,
    }));
    const buys = plan.buysSecond.map((t) => ({
      ticker: t.ticker,
      units: t.estimatedUnits,
      price: t.currentPrice,
    }));

    const result = await executeRebalancePlan(portfolio.id, sells, buys);

    if (!result.success) {
      // Mark log as rejected
      await prisma.rebalancingLog.update({
        where: { id: log.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(
        { error: "Rebalancing execution failed.", details: result.errors },
        { status: 500 }
      );
    }

    // Mark log as approved
    await prisma.rebalancingLog.update({
      where: { id: log.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      rebalancingLogId: log.id,
      tradesExecuted: plan.trades.length,
    });
  } catch (err) {
    console.error("[rebalance/approve POST]", err);
    return NextResponse.json({ error: "Failed to approve rebalancing plan." }, { status: 500 });
  }
}
