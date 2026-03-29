// app/api/kuberaa/etfs/suggest/route.ts
// GET /api/kuberaa/etfs/suggest — Get suggested ETFs for user's profile

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  selectETFs,
  bucketsToWeightEntries,
  validateWeights,
} from "@/lib/etf/selector";
import { computeAllocation } from "@/lib/allocation/engine";
import type { TimeHorizon } from "@/lib/allocation/engine";

export async function GET(req: NextRequest) {
  try {
    // Get userId from middleware-injected header
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Investor profile not found." }, { status: 404 });
    }

    // Compute allocation
    const allocation = computeAllocation(profile.riskScore, {
      capitalUSD: Number(profile.capitalUSD),
      timeHorizon: profile.timeHorizon as TimeHorizon,
      excludedAssets: profile.excludedAssets,
      esgOnly: profile.esgOnly,
    });

    const weights = {
      equityPct: allocation.equityPct,
      bondPct: allocation.bondPct,
      realEstatePct: allocation.realEstatePct,
      commoditiesPct: allocation.commoditiesPct,
      cashPct: allocation.cashPct,
    };

    // Select ETFs per bucket
    const buckets = await selectETFs(weights, {
      esgOnly: profile.esgOnly,
      excludedAssets: profile.excludedAssets,
      excludedSectors: profile.excludedSectors,
    });

    const weightEntries = bucketsToWeightEntries(buckets);
    const validationErrors = validateWeights(weightEntries, weights);

    // Convert validation errors map to plain object
    const errors: Record<string, string | null> = {};
    for (const [key, val] of Array.from(validationErrors.entries())) {
      errors[key] = val;
    }

    // Fetch full ETF details for the suggested tickers
    const suggestedTickers = weightEntries.map(e => e.ticker);
    const etfs = await prisma.eTF.findMany({
      where: { ticker: { in: suggestedTickers } },
    });

    // Merge weight info into ETF objects
    const etfsWithWeights = etfs.map(etf => {
      const entry = weightEntries.find(e => e.ticker === etf.ticker);
      return {
        ...etf,
        weight: entry?.weight ?? 0,
        suggested: true,
      };
    });

    // Calculate portfolio metrics
    const totalExpectedReturn = etfsWithWeights.reduce((sum, etf) => 
      sum + (Number(etf.historicalAnnualReturn) * (etf.weight / 100)), 0
    );
    const totalVolatility = Math.sqrt(
      etfsWithWeights.reduce((sum, etf) => 
        sum + Math.pow(Number(etf.historicalVolatility) * (etf.weight / 100), 2), 0
      )
    );
    const sharpeRatio = totalVolatility > 0 ? (totalExpectedReturn - 0.02) / totalVolatility : 0;

    return NextResponse.json({
      etfs: etfsWithWeights,
      totalExpectedReturn,
      totalVolatility,
      sharpeRatio,
      allocation,
      buckets,
      weightEntries,
      validationErrors: errors,
    });
  } catch (err) {
    console.error("[etfs/suggest GET]", err);
    return NextResponse.json({ error: "Failed to generate ETF suggestions." }, { status: 500 });
  }
}
