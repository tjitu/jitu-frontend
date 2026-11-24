import { areTryoutResultsAvailable } from "@/lib/tryout-results";
import { canPreviewTryout } from "./_lib/can-preview-tryout";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";
import { ATTEMPT_TIMESTAMPS, TRYOUT_SCHEDULE } from "@/lib/tryout-timing-sql";
import { isUserPremiumActive } from "@/lib/premium";
import {
  computeAttemptProgress,
  triggerAutoFinishIfNeeded,
} from "@/lib/tryout-attempt-helper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TryoutParams = { params: Promise<{ id: string }> };

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
              t."solutionPrice", ${TRYOUT_SCHEDULE},
              (SELECT COUNT(*)::int FROM "TryOutAttempt" a JOIN "user" u ON u.id = a."userId" WHERE a.try_out_id = t.id AND COALESCE(u."isSandbox", false) = false) AS participants
       FROM "TryOut" t WHERE t.id = $1 LIMIT 1`,
      [id],
    );
    const tryout = tryoutResult.rows[0];
    if (!tryout) {
      return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
    }

    let curationStatus = "PUBLISHED";
    let questionsReleased = true;
    let breakSeconds = 60;
    try {
      const { rows } = await pool.query(
        `SELECT
           COALESCE(curation_status, 'PUBLISHED') AS status,
           COALESCE(questions_released, COALESCE(curation_status, 'PUBLISHED') = 'PUBLISHED') AS "questionsReleased",
           COALESCE(break_seconds, 60)::int AS "breakSeconds"
         FROM "TryOut" WHERE id = $1 LIMIT 1`,
        [id],
      );
      curationStatus = String(rows[0]?.status || "PUBLISHED").toUpperCase();
      questionsReleased = Boolean(rows[0]?.questionsReleased ?? (curationStatus === "PUBLISHED"));
      breakSeconds = Math.max(0, Math.min(1800, Number(rows[0]?.breakSeconds ?? 60)));
    } catch (error) {
      // Databases predating Control Center treat existing tryouts as published.
      if ((error as { code?: string })?.code !== "42703") throw error;
    }

    const canPreview = await canPreviewTryout(request, user.id, id);
    const sandboxRows = await pool.query(`SELECT COALESCE("isSandbox", false) AS sandbox FROM "user" WHERE id = $1`, [user.id]);
    const isSandbox = Boolean(sandboxRows.rows[0]?.sandbox);
    if (curationStatus !== "PUBLISHED" && !canPreview) {
      return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
    }

    const isLiveBySchedule =
      curationStatus === "PUBLISHED" &&
      (!tryout.scheduledStart || new Date(tryout.scheduledStart) <= new Date());
    questionsReleased = Boolean(questionsReleased) || isLiveBySchedule;

    const [subtestResult, attemptResult, finishedAttemptResult, unlockResult, premiumResult] = await Promise.all([
      pool
        .query(
          `SELECT s.id, s.name, s."order", s.duration_minutes AS duration,
                  COALESCE(s.target_question_count, 20)::int AS "targetQuestionCount",
                  COUNT(q.id)::int AS "questionCount"
           FROM "Subtest" s
           LEFT JOIN "Question" q
             ON q.subtest_id = s.id
            AND ($2::boolean OR COALESCE(q.status, 'DRAFT') = 'READY')
           WHERE s.try_out_id = $1
           GROUP BY s.id, s.name, s."order", s.duration_minutes, s.target_question_count
           ORDER BY s."order" ASC`,
          [id, canPreview],
        )
        .catch(() =>
          pool.query(
            `SELECT s.id, s.name, s."order", s.duration_minutes AS duration,
                    20 AS "targetQuestionCount",
                    COUNT(q.id)::int AS "questionCount"
             FROM "Subtest" s
             LEFT JOIN "Question" q ON q.subtest_id = s.id
             WHERE s.try_out_id = $1
             GROUP BY s.id, s.name, s."order", s.duration_minutes
             ORDER BY s."order" ASC`,
            [id],
          ),
        ),
      pool.query(
        `SELECT id, status, total_score AS "totalScore",
                ${ATTEMPT_TIMESTAMPS}, current_subtest_order AS "currentSubtestOrder"
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

    let attempt = attemptResult.rows[0] ?? null;
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

    const seenSubtestNames = new Set<string>();
    const dedupSubtests = subtestResult.rows.filter((subtest) => {
      const key = String(subtest.name || subtest.order);
      if (seenSubtestNames.has(key)) return false;
      seenSubtestNames.add(key);
      return true;
    });

    const categories = dedupSubtests.map((subtest) => {
      const actualCount = Number(subtest.questionCount) || 0;
      const targetCount = Number(subtest.targetQuestionCount) || 20;
      const displayQuestionCount =
        !questionsReleased && actualCount === 0 ? targetCount : actualCount;
      return {
        id: Number(subtest.order),
        name: subtest.name,
        questionCount: displayQuestionCount,
        duration: Number(subtest.duration),
        isCompleted:
          actualCount > 0 &&
          (answeredBySubtest.get(subtest.id) ?? 0) >= actualCount,
        correctCount: 0,
        wrongCount: 0,
        emptyCount: 0,
      };
    });
    const premiumUser = premiumResult.rows[0];
    const premiumActive = id !== "sandbox-test-one-coin" && isUserPremiumActive({
      isPremium: premiumUser?.isPremium,
      premiumExpiresAt: premiumUser?.premiumExpiresAt,
    });
    const unlockedSolutions = premiumActive
      ? [{ id: "premium-pass", userId: user.id, tryOutId: id }]
      : unlockResult.rows;
    let latestFinishedAttempt = finishedAttemptResult.rows[0] ?? null;

    const populated = categories.filter((category) => category.questionCount > 0);
    const timings = (populated.length ? populated : categories).map((category) => ({
      order: category.id,
      durationMinutes: category.duration,
    }));
    let progress = computeAttemptProgress(
      id,
      attempt,
      latestFinishedAttempt,
      timings,
      isSandbox ? null : tryout.scheduledEnd,
    );

    if (progress.needAutoFinish && attempt?.id) {
      await triggerAutoFinishIfNeeded(
        [String(attempt.id)],
        request.headers.get("authorization"),
      );
      const refreshed = await pool.query(
        `SELECT id, status, total_score AS "totalScore",
                ${ATTEMPT_TIMESTAMPS}, current_subtest_order AS "currentSubtestOrder"
         FROM "TryOutAttempt" WHERE id = $1 AND "userId" = $2 LIMIT 1`,
        [attempt.id, user.id],
      );
      attempt = refreshed.rows[0] ?? attempt;
      if (attempt.status === "FINISHED") latestFinishedAttempt = attempt;
      progress = computeAttemptProgress(
        id,
        attempt,
        latestFinishedAttempt,
        timings,
        isSandbox ? null : tryout.scheduledEnd,
      );
    }

    const resultsAvailable = isSandbox
      ? Boolean(latestFinishedAttempt)
      : areTryoutResultsAvailable(tryout.scheduledEnd);
    const resultAccess = Number(tryout.solutionPrice ?? 0) === 0 || unlockedSolutions.length > 0;
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;
    if (resultAccess && latestFinishedAttempt?.id) {
      const counts = await pool.query(
        `SELECT s."order", COUNT(q.id)::int AS total,
                COUNT(ua.id) FILTER (WHERE ua."isCorrect" = true)::int AS correct,
                COUNT(ua.id) FILTER (WHERE ua."isCorrect" = false)::int AS wrong
         FROM "Subtest" s
         LEFT JOIN "Question" q ON q.subtest_id = s.id AND COALESCE(q.status, 'DRAFT') = 'READY'
         LEFT JOIN "UserAnswer" ua ON ua.question_id = q.id AND ua.tryout_attempt_id = $2
         WHERE s.try_out_id = $1
         GROUP BY s."order"`,
        [id, latestFinishedAttempt.id],
      );
      const byOrder = new Map(counts.rows.map((row) => [Number(row.order), row]));
      for (const category of categories) {
        const row = byOrder.get(category.id);
        category.correctCount = Number(row?.correct ?? 0);
        category.wrongCount = Number(row?.wrong ?? 0);
        category.emptyCount = Math.max(0, Number(row?.total ?? 0) - category.correctCount - category.wrongCount);
        correctCount += category.correctCount;
        wrongCount += category.wrongCount;
        emptyCount += category.emptyCount;
      }
    }

    return NextResponse.json({
      id: tryout.id,
      title: tryout.title,
      number: tryout.code == null ? "0" : String(tryout.code),
      badge: tryout.batch,
      participants: Number(tryout.participants) || 0,
      description: tryout.description || "",
      duration: categories.reduce((sum, category) => sum + category.duration, 0),
      totalQuestions: categories.reduce((sum, category) => sum + category.questionCount, 0),
      actualQuestionCount: dedupSubtests.reduce((sum, subtest) => sum + (Number(subtest.questionCount) || 0), 0),
      startDate: tryout.scheduledStart ? new Date(tryout.scheduledStart).toISOString() : "",
      endDate: tryout.scheduledEnd ? new Date(tryout.scheduledEnd).toISOString() : "",
      isRegistered: Boolean(attempt),
      isFree: Number(tryout.solutionPrice) === 0,
      tokenCost: Number(tryout.solutionPrice) || 0,
      unlockedSolutions,
      categories,
      benefits: ["Pembahasan lengkap", "Analisis hasil", "Simulasi UTBK"],
      requirements: ["Akun terverifikasi", "Token mencukupi"],
      latestFinishedAttemptId: progress.latestFinishedAttemptId,
      latestAttemptStatus: progress.status ?? null,
      latestAttemptId: progress.latestAttemptId,
      currentSubtestOrder: Number(attempt?.currentSubtestOrder) || 1,
      isWaitingTransition: progress.isWaitingTransition,
      nextSubtestOrder: progress.nextSubtestOrder,
      resumeUrl: progress.resumeUrl,
      latestScore: resultAccess && resultsAvailable && latestFinishedAttempt
        ? Math.round(Number(latestFinishedAttempt.totalScore) || 0)
        : null,
      resultsAvailable,
      isSandboxAccount: isSandbox,
      canBypassSchedule: canPreview,
      correctCount,
      wrongCount,
      emptyCount,
      curationStatus,
      questionsReleased,
      breakSeconds,
      isSandboxPreview: isSandbox || curationStatus !== "PUBLISHED" || (!questionsReleased && canPreview),
    });
  } catch (error) {
    console.error("GET /api/proxy/tryout/[id] error:", error);
    return NextResponse.json(
      { message: "Data tryout gagal dimuat. Coba muat ulang halaman." },
      { status: 500 },
    );
  }
}
