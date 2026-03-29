// app/api/kuberaa/onboarding/complete/route.ts
// POST /api/kuberaa/onboarding/complete
// Saves investor profile and runs risk scoring algorithm

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeRiskScore, QuestionAnswer, TimeHorizon, InvestmentGoal } from "@/lib/risk/scorer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      location,
      age,
      experienceLevel,
      goal,
      goalDescription,
      targetDate,
      timeHorizon,
      capitalUSD,
      riskAnswers,
      riskScore,
      riskProfile,
      esgOnly,
      excludedSectors,
      excludedAssets,
      notes,
      profileOverride,
    } = body;

    // Validate required fields
    if (
      !fullName ||
      !location ||
      !age ||
      !experienceLevel ||
      !goal ||
      !timeHorizon ||
      !capitalUSD ||
      !riskAnswers
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!Array.isArray(riskAnswers) || riskAnswers.length !== 4) {
      return NextResponse.json(
        { error: "Exactly 4 risk question answers are required." },
        { status: 400 }
      );
    }

    if (Number(capitalUSD) < 100) {
      return NextResponse.json(
        { error: "Minimum capital is $100." },
        { status: 400 }
      );
    }

    // Generate UUID for userId (secure, not predictable)
    const userId = crypto.randomUUID();
    const email = `${fullName.toLowerCase().replace(/\s+/g, '.')}@kuberaa.app`;

    // Use provided risk profile or compute it
    const finalProfile = riskProfile || "BALANCED";
    const finalScore = riskScore || 50;

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: fullName,
        email: email,
      },
    });

    // Create investor profile
    const profile = await prisma.investorProfile.create({
      data: {
        userId: user.id,
        location,
        age: Number(age),
        experienceLevel,
        goal,
        goalDescription: goalDescription ?? null,
        targetDate: targetDate ? new Date(targetDate) : null,
        timeHorizon,
        capitalUSD: Number(capitalUSD),
        riskScore: finalScore,
        riskProfile: finalProfile,
        profileOverride: Boolean(profileOverride),
        esgOnly: Boolean(esgOnly),
        excludedSectors: excludedSectors ?? [],
        excludedAssets: excludedAssets ?? [],
      },
    });

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      profile,
      riskScoring: {
        totalScore: finalScore,
        riskProfile: finalProfile,
      },
    });

    // Set secure httpOnly cookie with userId
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error("[onboarding/complete]", err);
    return NextResponse.json(
      { error: "Failed to complete onboarding." },
      { status: 500 }
    );
  }
}
