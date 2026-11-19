import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { isUserPremiumActive } from "@/lib/premium";
import { getLearningStats } from "@/lib/dashboard-stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req);

    if (!appUser) {
      return NextResponse.json({ error: "Silakan masuk untuk melihat progres belajar." }, { status: 401 });
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT "tokenBalance", "isPremium", "premiumExpiresAt" FROM "user" WHERE id = $1`,
      [appUser.id]
    );

    const user = rows[0] || {};
    const tokenBalance = Number(user.tokenBalance) || 0;
    const stats = await getLearningStats(pool, appUser.id);
    const premiumExpiresAt = user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
    const isPremium = isUserPremiumActive({
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
    });

    return NextResponse.json({
      tokenBalance,
      ...stats,
      isPremium,
      premiumExpiresAt: premiumExpiresAt ? premiumExpiresAt.toISOString() : null,
    });
  } catch (err) {
    console.error("GET /api/proxy/dashboard/stats error:", err);
    return NextResponse.json({ error: "Gagal memuat progres belajar." }, { status: 500 });
  }
}

