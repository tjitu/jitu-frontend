import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";
import { isUserPremiumActive } from "@/lib/premium";

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
    const body = await request.json().catch(() => ({}));

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userRes = await client.query(
        `SELECT "tokenBalance", "isPremium", "premiumExpiresAt"
         FROM "user" WHERE id = $1 FOR UPDATE`,
        [user.id],
      );
      const dbUser = userRes.rows[0];
      if (!dbUser) {
        await client.query("ROLLBACK");
        return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
      }
      const tryoutRes = await client.query(
        `SELECT "solutionPrice" FROM "TryOut" WHERE id = $1 FOR SHARE`,
        [tryoutId],
      );
      const tryout = tryoutRes.rows[0];
      if (!tryout) {
        await client.query("ROLLBACK");
        return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
      }
      const price = Number(tryout.solutionPrice ?? 0);
      const expectedPrice = Number(body?.expectedSolutionPrice);
      if (Number.isFinite(expectedPrice) && expectedPrice !== price) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: `Biaya pembahasan berubah menjadi ${price} coin. Silakan konfirmasi ulang.`, solutionPrice: price },
          { status: 409 },
        );
      }
      const registration = await client.query(
        `SELECT 1 FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2 LIMIT 1`,
        [user.id, tryoutId],
      );
      if (registration.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ message: "Daftar tryout terlebih dahulu." }, { status: 400 });
      }
      const existingRes = await client.query(
        `SELECT id FROM "UnlockedSolution" WHERE "userId" = $1 AND "tryOutId" = $2 LIMIT 1`,
        [user.id, tryoutId],
      );
      if (existingRes.rows[0]) {
        await client.query("COMMIT");
        return NextResponse.json({ message: "Pembahasan sudah terbuka" });
      }

      const premiumPass = isUserPremiumActive(dbUser);
      if (!premiumPass && price > 0) {
        const deductRes = await client.query(
          `UPDATE "user" SET "tokenBalance" = "tokenBalance" - $1, "updatedAt" = NOW()
           WHERE id = $2 AND "tokenBalance" >= $1 RETURNING "tokenBalance"`,
          [price, user.id],
        );
        if (deductRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { message: "Coin tidak cukup. Buka Shop untuk mendapatkan coin." },
            { status: 400 },
          );
        }
        await client.query(
          `INSERT INTO "TokenTransaction" (id, "userId", amount, type, "referenceId", "createdAt")
           VALUES ($1, $2, $3, 'PURCHASE_SOLUTION', $4, NOW())`,
          [randomUUID(), user.id, -price, tryoutId],
        );
      }
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
