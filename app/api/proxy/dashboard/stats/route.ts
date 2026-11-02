import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          tokenBalance: 0,
          lastScore: 0,
          personalBest: 0,
          weeklyActivity: 0,
          totalFinished: 0,
          currentStreak: 0,
        },
        { status: 200 }
      );
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT "tokenBalance", "currentStreak" FROM "user" WHERE id = $1`,
      [session.user.id]
    );

    const user = rows[0] || {};
    const tokenBalance = Number(user.tokenBalance) || 0;
    const currentStreak = Number(user.currentStreak) || 0;

    return NextResponse.json({
      tokenBalance,
      lastScore: 0,
      personalBest: 0,
      weeklyActivity: 0,
      totalFinished: 0,
      currentStreak,
    });
  } catch (err) {
    console.error("GET /api/proxy/dashboard/stats error:", err);
    return NextResponse.json({
      tokenBalance: 0,
      lastScore: 0,
      personalBest: 0,
      weeklyActivity: 0,
      totalFinished: 0,
      currentStreak: 0,
    });
  }
}

