// app/api/kuberaa/debug/users/route.ts
// GET /api/kuberaa/debug/users — Get all users (debug only)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users, count: users.length });
  } catch (err) {
    console.error("[debug/users GET]", err);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
