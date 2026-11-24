import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";
import { isUserPremiumActive } from "@/lib/premium";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TryoutParams = { params: Promise<{ id: string }> };

async function canPreviewTryout(
  request: NextRequest,
  userId: string,
  tryoutId: string,
): Promise<boolean> {
  const pool = getDbPool();

  try {
    const { rows } = await pool.query(
      `SELECT role, COALESCE("isSandbox", false) AS "isSandbox"
       FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (rows[0]?.role === "ADMIN" || rows[0]?.isSandbox === true) return true;
  } catch (error) {
    if ((error as { code?: string })?.code !== "42703") throw error;
    const { rows } = await pool.query(
      `SELECT role FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (rows[0]?.role === "ADMIN") return true;
  }

  const token = request.headers.get("x-sandbox-token")?.trim() || "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return false;

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { rows } = await pool.query(
      `SELECT 1 FROM "QcSandboxPreviewSession"
       WHERE token_hash = $1 AND tryout_id = $2 AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash, tryoutId],
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

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
    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === "PREMIUM" ? "PREMIUM" : "FREE";
    const expectedPrice = Number(body?.expectedSolutionPrice);
    const pool = getDbPool();

    const tryoutResult = await pool.query(
      `SELECT id, "scheduledStart", "scheduledEnd", "solutionPrice"
       FROM "TryOut" WHERE id = $1 LIMIT 1`,
      [tryoutId],
    );
    const tryout = tryoutResult.rows[0];
    if (!tryout) {
      return NextResponse.json(
        { message: "Tryout tidak ditemukan." },
        { status: 404 },
      );
    }

    let curationStatus = "PUBLISHED";
    try {
      const { rows } = await pool.query(
        `SELECT COALESCE(curation_status, 'PUBLISHED') AS status
         FROM "TryOut" WHERE id = $1 LIMIT 1`,
        [tryoutId],
      );
      curationStatus = String(rows[0]?.status || "PUBLISHED").toUpperCase();
    } catch (error) {
      if ((error as { code?: string })?.code !== "42703") throw error;
    }

    if (
      curationStatus !== "PUBLISHED" &&
      !(await canPreviewTryout(request, user.id, tryoutId))
    ) {
      return NextResponse.json(
        { message: "Tryout tidak ditemukan atau masih dalam tahap penyiapan QC." },
        { status: 404 },
      );
    }

    const sandboxRows = await pool.query(`SELECT COALESCE("isSandbox", false) AS sandbox FROM "user" WHERE id = $1`, [user.id]);
    if (curationStatus === "PUBLISHED" && !sandboxRows.rows[0]?.sandbox) {
      const now = new Date();
      // Siswa diperbolehkan mendaftar sebelum dan selama tryout; pendaftaran hanya ditolak jika jadwal telah berakhir
      if (tryout.scheduledEnd && now > new Date(tryout.scheduledEnd)) {
        return NextResponse.json(
          { message: "Masa pengerjaan tryout sudah berakhir." },
          { status: 400 },
        );
      }
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userResult = await client.query(
        `SELECT id, "tokenBalance", "isPremium", "premiumExpiresAt" FROM "user" WHERE id = $1 FOR UPDATE`,
        [user.id],
      );
      if (!userResult.rows[0]) {
        await client.query("ROLLBACK");
        return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
      }

      const priceResult = await client.query(
        `SELECT "solutionPrice" FROM "TryOut" WHERE id = $1 FOR SHARE`,
        [tryoutId],
      );
      const price = Number(priceResult.rows[0]?.solutionPrice ?? 0);
      if (Number.isFinite(expectedPrice) && expectedPrice !== price) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: `Biaya pembahasan berubah menjadi ${price} coin. Muat ulang halaman lalu daftar kembali.`, solutionPrice: price },
          { status: 409 },
        );
      }

      const existingResult = await client.query(
        `SELECT id FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2 LIMIT 1`,
        [user.id, tryoutId],
      );
      const attemptId = existingResult.rows[0]?.id || randomUUID();
      if (!existingResult.rows[0]) {
        await client.query(
          `INSERT INTO "TryOutAttempt" (id, "userId", try_out_id, status, total_score, current_subtest_order, started_at)
           VALUES ($1, $2, $3, 'NOT_STARTED', 0, 0, NOW())`,
          [attemptId, user.id, tryoutId],
        );
      }

      let isPremium = false;
      if (mode === "PREMIUM" && price > 0) {
        const unlockResult = await client.query(
          `SELECT id FROM "UnlockedSolution" WHERE "userId" = $1 AND "tryOutId" = $2 LIMIT 1`,
          [user.id, tryoutId],
        );
        isPremium = true;
        if (!unlockResult.rows[0] && (tryoutId === "sandbox-test-one-coin" || !isUserPremiumActive(userResult.rows[0]))) {
          const deducted = await client.query(
            `UPDATE "user" SET "tokenBalance" = "tokenBalance" - $1, "updatedAt" = NOW()
             WHERE id = $2 AND "tokenBalance" >= $1 RETURNING "tokenBalance"`,
            [price, user.id],
          );
          if (deducted.rowCount === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json({ message: "Coin tidak cukup. Buka Shop untuk mendapatkan coin." }, { status: 400 });
          }
          await client.query(
            `INSERT INTO "TokenTransaction" (id, "userId", amount, type, "referenceId", "createdAt")
             VALUES ($1, $2, $3, 'PURCHASE_SOLUTION', $4, NOW())`,
            [randomUUID(), user.id, -price, tryoutId],
          );
          await client.query(
            `INSERT INTO "UnlockedSolution" (id, "userId", "tryOutId", "unlockedAt")
             VALUES ($1, $2, $3, NOW())`,
            [randomUUID(), user.id, tryoutId],
          );
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({
        message: isPremium ? "Berhasil daftar dengan pembahasan." : "Berhasil mendaftar tryout",
        attemptId,
        isRegistered: true,
        isPremium,
        solutionPrice: price,
      });
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/proxy/tryout/[id]/register error:", error);
    return NextResponse.json(
      { message: "Gagal mendaftar tryout." },
      { status: 500 },
    );
  }
}
