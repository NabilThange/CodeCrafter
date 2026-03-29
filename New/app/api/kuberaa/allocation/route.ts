// app/api/kuberaa/allocation/route.ts
// GET /api/kuberaa/allocation — Get computed allocation for user
// PATCH /api/kuberaa/allocation — User edits allocation sliders

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  computeAllocation,
  adjustAllocation,
  validateAllocationTotal,
  allocationToEdit,
  AllocationEdit,
} from "@/lib/kuberaa/allocation";
import type { TimeHorizon } from "@/lib/kuberaa/allocation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query param required." }, { status: 400 });
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Investor profile not found." }, { status: 404 });
    }

    const allocation = computeAllocation(profile.riskScore, {
      capitalUSD: Number(profile.capitalUSD),
      timeHorizon: profile.timeHorizon as TimeHorizon,
      excludedAssets: profile.excludedAssets,
      esgOnly: profile.esgOnly,
    });

    return NextResponse.json({
      allocation,
      riskScore: profile.riskScore,
      riskProfile: profile.riskProfile,
      edit: allocationToEdit(allocation),
    });
  } catch (err) {
    console.error("[allocation GET]", err);
    return NextResponse.json({ error: "Failed to compute allocation." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, editedAllocation, changedKey } = body;

    if (!userId || !editedAllocation || !changedKey) {
      return NextResponse.json(
        { error: "userId, editedAllocation, and changedKey are required." },
        { status: 400 }
      );
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Investor profile not found." }, { status: 404 });
    }

    // Adjust the user-edited allocation to maintain 100% total
    const adjusted = adjustAllocation(
      editedAllocation as AllocationEdit,
      changedKey as keyof AllocationEdit
    );

    if (!validateAllocationTotal(adjusted)) {
      return NextResponse.json(
        { error: "Allocation does not sum to 100%." },
        { status: 400 }
      );
    }

    return NextResponse.json({ allocation: adjusted });
  } catch (err) {
    console.error("[allocation PATCH]", err);
    return NextResponse.json({ error: "Failed to adjust allocation." }, { status: 500 });
  }
}
