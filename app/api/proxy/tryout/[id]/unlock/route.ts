import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TryoutParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: TryoutParams) {
  try {
    const user = await getAuthenticatedAppUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Silakan masuk terlebih dahulu." },
        { status: 401 },
      );
    }

    const { id: tryoutId } = await params;
    const pool = getDbPool();

    const tryoutRes = await pool.query(
      `SELECT "solutionPrice", title FROM "TryOut" WHERE id = $1 LIMIT 1`,
      [tryoutId],
    );
    const tryout = tryoutRes.rows[0];
    if (!tryout) {
      return NextResponse.json(
        { message: "Tryout tidak ditemukan." },
        { status: 404 },
      );
    }

    const existingRes = await pool.query(
      `SELECT id FROM "UnlockedSolution"
       WHERE "userId" = $1 AND "tryOutId" = $2
       LIMIT 1`,
      [user.id, tryoutId],
    );
    if (existingRes.rows[0]) {
      return NextResponse.json({ message: "Pembahasan sudah terbuka" });
    }

    const userRes = await pool.query(
      `SELECT "tokenBalance", "isPremium", "premiumExpiresAt"
       FROM "user" WHERE id = $1 LIMIT 1`,
      [user.id],
    );
    const dbUser = userRes.rows[0];
    if (!dbUser) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    }

    const isUserPremium =
      Boolean(dbUser.isPremium) &&
      (!dbUser.premiumExpiresAt || new Date(dbUser.premiumExpiresAt) > new Date());
    const price = Number(tryout.solutionPrice) || 0;

    if (isUserPremium || price <= 0) {
      const unlockId = randomUUID();
      await pool.query(
        `INSERT INTO "UnlockedSolution" (id, "userId", "tryOutId", "unlockedAt")
         VALUES ($1, $2, $3, NOW())`,
        [unlockId, user.id, tryoutId],
      );
      return NextResponse.json({
        id: unlockId,
        userId: user.id,
        tryOutId: tryoutId,
        message: "Hasil dan pembahasan terbuka.",
      });
    }

    if (Number(dbUser.tokenBalance) < price) {
      return NextResponse.json(
        { message: "Saldo Token tidak mencukupi" },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE "user"
         SET "tokenBalance" = "tokenBalance" - $1, "updatedAt" = NOW()
         WHERE id = $2`,
        [price, user.id],
      );
      await client.query(
        `INSERT INTO "TokenTransaction" (id, "userId", amount, type, "referenceId", "createdAt")
         VALUES ($1, $2, $3, 'PURCHASE_SOLUTION', $4, NOW())`,
        [randomUUID(), user.id, -price, tryoutId],
      );
      const unlockId = randomUUID();
      await client.query(
        `INSERT INTO "UnlockedSolution" (id, "userId", "tryOutId", "unlockedAt")
         VALUES ($1, $2, $3, NOW())`,
        [unlockId, user.id, tryoutId],
      );
      await client.query("COMMIT");
      return NextResponse.json({
        id: unlockId,
        userId: user.id,
        tryOutId: tryoutId,
        message: "Hasil dan pembahasan terbuka.",
      });
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/proxy/tryout/[id]/unlock error:", error);
    return NextResponse.json(
      { message: "Gagal membuka pembahasan." },
      { status: 500 },
    );
  }
}
