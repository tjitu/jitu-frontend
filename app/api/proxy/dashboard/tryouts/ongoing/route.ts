import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import {
  computeAttemptProgress,
  triggerAutoFinishIfNeeded,
} from "@/lib/tryout-attempt-helper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(request).catch(() => null);
    if (!user?.id) {
      return NextResponse.json([]);
    }

    const pool = getDbPool();
    const { rows: tryoutRows } = await pool.query(
      `SELECT
         t.id,
         t.title,
         t.description,
         COALESCE(t."solutionPrice", 0)::int AS "solutionPrice",
         t."isPublic",
         COALESCE(t."isSpecial", false) AS "isSpecial",
         t."scheduledStart",
         t."scheduledEnd",
         t."createdAt",
         COUNT(DISTINCT a.id)::int AS participants
       FROM "TryOut" t
       LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
       WHERE t."isPublic" = true
         AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'
         AND (t."scheduledStart" IS NULL OR t."scheduledStart" <= NOW())
       GROUP BY t.id, t.title, t.description, t."solutionPrice", t."isPublic", t."isSpecial", t."scheduledStart", t."scheduledEnd", t."createdAt"
       ORDER BY t."scheduledStart" DESC NULLS LAST`,
    );

    if (tryoutRows.length === 0) {
      return NextResponse.json([]);
    }

    const tryoutIds = tryoutRows.map((r) => String(r.id));
    const [attemptRes, subtestRes] = await Promise.all([
      pool.query(
        `SELECT id, try_out_id AS "tryOutId", status, total_score AS "totalScore",
                started_at AS "startedAt", finished_at AS "finishedAt",
                current_subtest_order AS "currentSubtestOrder",
                subtest_started_at AS "subtestStartedAt"
         FROM "TryOutAttempt"
         WHERE "userId" = $1 AND try_out_id = ANY($2::text[])
         ORDER BY started_at DESC`,
        [user.id, tryoutIds],
      ),
      pool.query(
        `SELECT try_out_id AS "tryOutId", "order", duration_minutes AS "durationMinutes"
         FROM "Subtest"
         WHERE try_out_id = ANY($1::text[])
         ORDER BY "order" ASC`,
        [tryoutIds],
      ),
    ]);

    const subtestsByTryout = new Map<
      string,
      Array<{ order: number; durationMinutes: number }>
    >();
    for (const s of subtestRes.rows) {
      const list = subtestsByTryout.get(String(s.tryOutId)) || [];
      list.push({
        order: Number(s.order),
        durationMinutes: Number(s.durationMinutes) || 0,
      });
      subtestsByTryout.set(String(s.tryOutId), list);
    }

    const attemptsByTryout = new Map<string, typeof attemptRes.rows>();
    for (const a of attemptRes.rows) {
      const list = attemptsByTryout.get(String(a.tryOutId)) || [];
      list.push(a);
      attemptsByTryout.set(String(a.tryOutId), list);
    }

    const toFinishIds: string[] = [];
    const results = tryoutRows.map((t) => {
      const tryoutId = String(t.id);
      const userAttempts = attemptsByTryout.get(tryoutId) || [];
      const latestAttempt = userAttempts[0] ?? null;
      const latestFinished =
        userAttempts.find((a) => a.status === "FINISHED") ?? null;
      const progress = computeAttemptProgress(
        tryoutId,
        latestAttempt,
        latestFinished,
        subtestsByTryout.get(tryoutId) || [],
        t.scheduledEnd,
      );

      if (progress.needAutoFinish && latestAttempt?.id) {
        toFinishIds.push(String(latestAttempt.id));
      }

      return {
        id: tryoutId,
        title: t.title,
        description: t.description ?? null,
        solutionPrice: Number(t.solutionPrice) || 0,
        isPublic: Boolean(t.isPublic),
        isSpecial: Boolean(t.isSpecial),
        scheduledStart: t.scheduledStart
          ? new Date(t.scheduledStart).toISOString()
          : null,
        scheduledEnd: t.scheduledEnd
          ? new Date(t.scheduledEnd).toISOString()
          : null,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
        participants: Number(t.participants) || 0,
        isRegistered: userAttempts.length > 0,
        status: progress.status,
        latestAttemptId: progress.latestAttemptId,
        latestFinishedAttemptId: progress.latestFinishedAttemptId,
        resumeUrl: progress.resumeUrl,
        isWaitingTransition: progress.isWaitingTransition,
        nextSubtestOrder: progress.nextSubtestOrder,
        score: progress.score,
      };
    });

    if (toFinishIds.length > 0) {
      await triggerAutoFinishIfNeeded(
        toFinishIds,
        request.headers.get("authorization"),
      );
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/proxy/dashboard/tryouts/ongoing error:", err);
    return NextResponse.json([]);
  }
}
