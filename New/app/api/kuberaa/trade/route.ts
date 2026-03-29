// app/api/kuberaa/trade/route.ts
// POST /api/kuberaa/trade — Execute paper trade (buy or sell)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeBuy, executeSell } from "@/lib/trading/executor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, ticker, units, currentPrice } = body;

    if (!userId || !type || !ticker || !units || !currentPrice) {
      return NextResponse.json(
        { error: "userId, type (BUY|SELL), ticker, units, and currentPrice are required." },
        { status: 400 }
      );
    }

    if (type !== "BUY" && type !== "SELL") {
      return NextResponse.json({ error: "type must be BUY or SELL." }, { status: 400 });
    }

    if (Number(units) <= 0) {
      return NextResponse.json({ error: "units must be positive." }, { status: 400 });
    }

    if (Number(currentPrice) <= 0) {
      return NextResponse.json({ error: "currentPrice must be positive." }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    // Verify ETF exists
    const etf = await prisma.eTF.findUnique({ where: { ticker } });
    if (!etf) {
      return NextResponse.json({ error: `ETF ${ticker} not found.` }, { status: 404 });
    }

    let result;
    if (type === "BUY") {
      result = await executeBuy({
        portfolioId: portfolio.id,
        etfTicker: ticker,
        units: Number(units),
        currentPrice: Number(currentPrice),
        reason: "MANUAL",
      });
    } else {
      result = await executeSell({
        portfolioId: portfolio.id,
        etfTicker: ticker,
        units: Number(units),
        currentPrice: Number(currentPrice),
        reason: "MANUAL",
      });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      newVirtualCash: result.newVirtualCash,
      newUnits: result.newUnits,
    });
  } catch (err) {
    console.error("[trade POST]", err);
    return NextResponse.json({ error: "Failed to execute trade." }, { status: 500 });
  }
}
