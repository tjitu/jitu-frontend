import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_URL = process.env.NESTJS_BACKEND_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedAppUser(req);
    if (!authUser) {
      return NextResponse.json(
        { message: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    // Attempt to proxy to NestJS backend if available
    try {
      const authorization = req.headers.get("authorization");
      const backendRes = await fetch(`${BACKEND_URL}/profile`, {
        method: "GET",
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
          "Content-Type": "application/json",
        },
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch {
      // Backend unreachable; proceed to direct DB fallback
    }

    // Direct database query fallback via pool
    const pool = getDbPool();
    const userRes = await pool.query(
      `SELECT id, name, email, image, "tokenBalance", target, "currentStreak", "isPremium", "premiumExpiresAt"
       FROM "user" WHERE id = $1`,
      [authUser.id]
    );

    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const statsRes = await pool.query(
      `SELECT COUNT(*)::int as total, COALESCE(AVG("totalScore"), 0)::numeric as avg_score
       FROM "TryOutAttempt" WHERE "userId" = $1 AND status = 'FINISHED'`,
      [authUser.id]
    );
    const statsRow = statsRes.rows[0];

    const attemptsRes = await pool.query(
      `SELECT a.id, t.title, a."startedAt" as date, a."totalScore" as score, a.status
       FROM "TryOutAttempt" a
       JOIN "TryOut" t ON a.try_out_id = t.id
       WHERE a."userId" = $1
       ORDER BY a."startedAt" DESC
       LIMIT 5`,
      [authUser.id]
    );

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        tokenBalance: Number(user.tokenBalance) || 0,
        target: user.target,
        isPremium: Boolean(user.isPremium),
        premiumExpiresAt: user.premiumExpiresAt,
      },
      stats: {
        totalTryout: statsRow?.total || 0,
        averageScore: Math.round(Number(statsRow?.avg_score) || 0),
        lastScore: attemptsRes.rows[0]?.score || 0,
        streak: Number(user.currentStreak) || 0,
      },
      attempts: attemptsRes.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        score: row.score,
        status: row.status === "FINISHED" ? (row.score > 700 ? "EXCELLENT" : "COMPLETED") : "ONGOING",
      })),
      pendingPayment: null,
    });
  } catch (err: unknown) {
    console.error("GET /api/proxy/profile error:", err);
    return NextResponse.json(
      { message: "Gagal memuat profil." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedAppUser(req);
    if (!authUser) {
      return NextResponse.json(
        { message: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, target, image } = body;

    const pool = getDbPool();
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (typeof name === "string") {
      updates.push(`"name" = $${idx++}`);
      values.push(name.trim());
    }
    if (typeof target === "string") {
      updates.push(`"target" = $${idx++}`);
      values.push(target);
    }
    if (typeof image === "string") {
      updates.push(`"image" = $${idx++}`);
      values.push(image.trim());
    }

    if (updates.length > 0) {
      values.push(authUser.id);
      await pool.query(
        `UPDATE "user" SET ${updates.join(", ")}, "updatedAt" = NOW() WHERE id = $${idx}`,
        values
      );
    }

    // Try notifying backend as well (fire and forget)
    try {
      const authorization = req.headers.get("authorization");
      void fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).catch(() => {});
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: true, message: "Profil berhasil diperbarui." },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("PATCH /api/proxy/profile error:", err);
    return NextResponse.json(
      { message: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}
