// app/api/kuberaa/profile/route.ts
// GET /api/kuberaa/profile — Get investor profile
// PATCH /api/kuberaa/profile — Update profile / override risk

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeRiskScore, QuestionAnswer, TimeHorizon, InvestmentGoal } from "@/lib/risk/scorer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query param required." }, { status: 400 });
    }

    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const existing = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    // If major scoring fields change, recompute risk score (unless override)
    let riskScore = existing.riskScore;
    let riskProfile = existing.riskProfile;

    const needsRescore =
      !updates.profileOverride &&
      (updates.questionAnswers ||
        updates.timeHorizon ||
        updates.goal ||
        updates.capitalUSD);

    if (needsRescore && updates.questionAnswers) {
      const rescored = computeRiskScore({
        questionAnswers: updates.questionAnswers as QuestionAnswer[],
        timeHorizon: (updates.timeHorizon ?? existing.timeHorizon) as TimeHorizon,
        goal: (updates.goal ?? existing.goal) as InvestmentGoal,
        capitalUSD: Number(updates.capitalUSD ?? existing.capitalUSD),
      });
      riskScore = rescored.totalScore;
      riskProfile = rescored.riskProfile;
    }

    // If manual override, trust the provided override profile
    if (updates.profileOverride && updates.riskProfile) {
      riskProfile = updates.riskProfile;
    }

    // Remove non-schema fields
    const { questionAnswers: _qa, ...safeUpdates } = updates;

    const updated = await prisma.investorProfile.update({
      where: { userId },
      data: {
        ...safeUpdates,
        riskScore,
        riskProfile,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("[profile PATCH]", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
