import { createHash } from "node:crypto";
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
    // Older databases may not yet have the optional isSandbox column.
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
    // A preview token is never accepted when its session cannot be verified.
    return false;
  }
}

export async function GET(request: NextRequest, { params }: TryoutParams) {
  try {
    const user = await getAuthenticatedAppUser(request);
    if (!user) {
      return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const { id } = await params;
    const pool = getDbPool();
    const tryoutResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.code, t.batch,
              t."solutionPrice", t."scheduledStart", t."scheduledEnd",
              (SELECT COUNT(*)::int FROM "TryOutAttempt" a WHERE a.try_out_id = t.id) AS participants
       FROM "TryOut" t WHERE t.id = $1 LIMIT 1`,
      [id],
    );
    const tryout = tryoutResult.rows[0];
    if (!tryout) {
      return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
    }

    let curationStatus = "PUBLISHED";
    try {
      const { rows } = await pool.query(
        `SELECT COALESCE(curation_status, 'PUBLISHED') AS status
         FROM "TryOut" WHERE id = $1 LIMIT 1`,
        [id],
      );
      curationStatus = String(rows[0]?.status || "PUBLISHED").toUpperCase();
    } catch (error) {
      // Databases predating Control Center treat existing tryouts as published.
      if ((error as { code?: string })?.code !== "42703") throw error;
    }

    if (curationStatus !== "PUBLISHED" && !(await canPreviewTryout(request, user.id, id))) {
      return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
    }

    const [subtestResult, attemptResult, finishedAttemptResult, unlockResult, premiumResult] = await Promise.all([
      pool.query(
        `SELECT s.id, s.name, s."order", s.duration_minutes AS duration,
                COUNT(q.id)::int AS "questionCount"
         FROM "Subtest" s
         LEFT JOIN "Question" q ON q.subtest_id = s.id
         WHERE s.try_out_id = $1
         GROUP BY s.id, s.name, s."order", s.duration_minutes
         ORDER BY s."order" ASC`,
        [id],
      ),
      pool.query(
        `SELECT id, status, total_score AS "totalScore",
                current_subtest_order AS "currentSubtestOrder"
         FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2
         ORDER BY started_at DESC LIMIT 1`,
        [user.id, id],
      ),
      pool.query(
        `SELECT id, total_score AS "totalScore"
         FROM "TryOutAttempt"
         WHERE "userId" = $1 AND try_out_id = $2 AND status = 'FINISHED'
         ORDER BY finished_at DESC NULLS LAST, started_at DESC
         LIMIT 1`,
        [user.id, id],
      ),
      pool.query(
        `SELECT id, "userId", "tryOutId", "unlockedAt"
         FROM "UnlockedSolution" WHERE "userId" = $1 AND "tryOutId" = $2`,
        [user.id, id],
      ),
      pool.query(
        `SELECT "isPremium", "premiumExpiresAt" FROM "user" WHERE id = $1 LIMIT 1`,
        [user.id],
      ),
    ]);

    const attempt = attemptResult.rows[0] ?? null;
    const answeredBySubtest = new Map<string, number>();
    if (attempt?.status === "IN_PROGRESS") {
      const { rows } = await pool.query(
        `SELECT q.subtest_id AS "subtestId", COUNT(DISTINCT ua.question_id)::int AS count
         FROM "UserAnswer" ua
         JOIN "Question" q ON q.id = ua.question_id
         WHERE ua.tryout_attempt_id = $1
         GROUP BY q.subtest_id`,
        [attempt.id],
      );
      for (const row of rows) answeredBySubtest.set(row.subtestId, Number(row.count));
    }

    const categories = subtestResult.rows.map((subtest) => ({
      id: Number(subtest.order),
      name: subtest.name,
      questionCount: Number(subtest.questionCount),
      duration: Number(subtest.duration),
      isCompleted:
        Number(subtest.questionCount) > 0 &&
        (answeredBySubtest.get(subtest.id) ?? 0) >= Number(subtest.questionCount),
    }));
    const premiumUser = premiumResult.rows[0];
    const premiumActive = Boolean(premiumUser?.isPremium) &&
      (!premiumUser.premiumExpiresAt || new Date(premiumUser.premiumExpiresAt) > new Date());
    const unlockedSolutions = premiumActive
      ? [{ id: "premium-pass", userId: user.id, tryOutId: id }]
      : unlockResult.rows;
    const latestFinishedAttempt = finishedAttemptResult.rows[0] ?? null;

    return NextResponse.json({
      id: tryout.id,
      title: tryout.title,
      number: tryout.code == null ? "0" : String(tryout.code),
      badge: tryout.batch,
      participants: Number(tryout.participants) || 0,
      description: tryout.description || "",
      duration: categories.reduce((sum, category) => sum + category.duration, 0),
      totalQuestions: categories.reduce((sum, category) => sum + category.questionCount, 0),
      startDate: tryout.scheduledStart ? new Date(tryout.scheduledStart).toISOString() : "",
      endDate: tryout.scheduledEnd ? new Date(tryout.scheduledEnd).toISOString() : "",
      isRegistered: Boolean(attempt),
      isFree: Number(tryout.solutionPrice) === 0,
      tokenCost: Number(tryout.solutionPrice) || 0,
      unlockedSolutions,
      categories,
      benefits: ["Pembahasan lengkap", "Analisis hasil", "Simulasi UTBK"],
      requirements: ["Akun terverifikasi", "Token mencukupi"],
      latestFinishedAttemptId: latestFinishedAttempt?.id ?? null,
      latestAttemptStatus: attempt?.status ?? null,
      latestAttemptId: attempt?.id ?? null,
      currentSubtestOrder: Number(attempt?.currentSubtestOrder) || 1,
      latestScore: Math.round(Number(latestFinishedAttempt?.totalScore) || 0),
      curationStatus,
      isSandboxPreview: curationStatus !== "PUBLISHED",
    });
  } catch (error) {
    console.error("GET /api/proxy/tryout/[id] error:", error);
    return NextResponse.json(
      { message: "Data tryout gagal dimuat. Coba muat ulang halaman." },
      { status: 500 },
    );
  }
}
