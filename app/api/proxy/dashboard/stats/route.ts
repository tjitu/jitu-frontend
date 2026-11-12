import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req);

    if (!appUser) {
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
      `SELECT "tokenBalance", "currentStreak", "isPremium", "premiumExpiresAt" FROM "user" WHERE id = $1`,
      [appUser.id]
    );

    const user = rows[0] || {};
    const tokenBalance = Number(user.tokenBalance) || 0;
    const currentStreak = Number(user.currentStreak) || 0;
    const premiumExpiresAt = user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
    const isPremium = Boolean(user.isPremium) && (!premiumExpiresAt || premiumExpiresAt.getTime() > Date.now());

    return NextResponse.json({
      tokenBalance,
      lastScore: 0,
      personalBest: 0,
      weeklyActivity: 0,
      totalFinished: 0,
      currentStreak,
      isPremium,
      premiumExpiresAt: premiumExpiresAt ? premiumExpiresAt.toISOString() : null,
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

