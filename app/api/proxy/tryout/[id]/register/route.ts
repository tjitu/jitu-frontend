import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";

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
    const pool = getDbPool();

    const tryoutResult = await pool.query(
      `SELECT id, "scheduledStart", "scheduledEnd"
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

    if (curationStatus === "PUBLISHED") {
      const now = new Date();
      // Siswa diperbolehkan mendaftar sebelum dan selama tryout; pendaftaran hanya ditolak jika jadwal telah berakhir
      if (tryout.scheduledEnd && now > new Date(tryout.scheduledEnd)) {
        return NextResponse.json(
          { message: "Masa pengerjaan tryout sudah berakhir." },
          { status: 400 },
        );
      }
    }

    const existingResult = await pool.query(
      `SELECT id FROM "TryOutAttempt"
       WHERE "userId" = $1 AND try_out_id = $2
       LIMIT 1`,
      [user.id, tryoutId],
    );

    if (existingResult.rows[0]) {
      return NextResponse.json({
        message: "User sudah terdaftar pada tryout ini",
        attemptId: existingResult.rows[0].id,
        isRegistered: true,
      });
    }

    const newAttemptId = randomUUID();
    await pool.query(
      `INSERT INTO "TryOutAttempt" (id, "userId", try_out_id, status, total_score, current_subtest_order, started_at)
       VALUES ($1, $2, $3, 'NOT_STARTED', 0, 0, NOW())`,
      [newAttemptId, user.id, tryoutId],
    );

    return NextResponse.json({
      message: "Berhasil mendaftar tryout",
      attemptId: newAttemptId,
      isRegistered: true,
    });
  } catch (error) {
    console.error("POST /api/proxy/tryout/[id]/register error:", error);
    return NextResponse.json(
      { message: "Gagal mendaftar tryout." },
      { status: 500 },
    );
  }
}
