// app/api/kuberaa/market/trends/route.ts
// GET /api/kuberaa/market/trends — Proxy to Part 1 platform market data
// Per PRD: Kuberaa does NOT independently source market data — it consumes Part 1

import { NextRequest, NextResponse } from "next/server";

const MAIN_PLATFORM_URL = process.env.MAIN_PLATFORM_MARKET_URL ?? "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "indices"; // indices | etf | sector | vix

    // If main platform URL is configured, proxy the request
    if (MAIN_PLATFORM_URL) {
      const upstream = await fetch(`${MAIN_PLATFORM_URL}?type=${type}`, {
        next: { revalidate: 60 }, // cache for 60s
      });
      const data = await upstream.json();
      return NextResponse.json(data);
    }

    // Fallback: return mock data for development
    // In production, MAIN_PLATFORM_MARKET_URL must be set
    const mockData = getMockMarketData(type);
    return NextResponse.json({
      source: "mock",
      note: "Set MAIN_PLATFORM_MARKET_URL env var to connect live market data from Part 1.",
      data: mockData,
    });
  } catch (err) {
    console.error("[market/trends GET]", err);
    return NextResponse.json({ error: "Failed to fetch market trends." }, { status: 500 });
  }
}

function getMockMarketData(type: string) {
  const baseDate = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  if (type === "indices") {
    return {
      sp500: dates.map((date, i) => ({ date, value: 4800 + i * 15 + Math.random() * 50 })),
      nasdaq: dates.map((date, i) => ({ date, value: 15200 + i * 20 + Math.random() * 80 })),
      dowjones: dates.map((date, i) => ({ date, value: 38000 + i * 10 + Math.random() * 60 })),
    };
  }

  if (type === "sector") {
    return [
      { sector: "Technology", returnPct: 0.182 },
      { sector: "Healthcare", returnPct: 0.091 },
      { sector: "Financials", returnPct: 0.143 },
      { sector: "Energy", returnPct: 0.067 },
      { sector: "Consumer Disc.", returnPct: 0.112 },
      { sector: "Industrials", returnPct: 0.088 },
      { sector: "Real Estate", returnPct: -0.023 },
      { sector: "Utilities", returnPct: 0.011 },
    ];
  }

  if (type === "vix") {
    return dates.map((date, i) => ({
      date,
      value: 15 + Math.sin(i / 3) * 5 + Math.random() * 2,
    }));
  }

  return {};
}
