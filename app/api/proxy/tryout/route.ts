import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { ATTEMPT_TIMESTAMPS, TRYOUT_SCHEDULE } from "@/lib/tryout-timing-sql";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import {
  type AttemptSummaryRow,
  computeAttemptProgress,
  triggerAutoFinishIfNeeded,
} from "@/lib/tryout-attempt-helper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(request).catch(() => null);
    const pool = getDbPool();
    const isAdmin = user?.role === "ADMIN";
    const curationFilter = isAdmin
      ? ""
      : `AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'`;

    const query = user?.id
      ? `
        SELECT
          t.id,
          t.title,
          t.code,
          t.batch,
          t."solutionPrice",
          t."isPublic",
          ${TRYOUT_SCHEDULE},
          COUNT(DISTINCT a.id) FILTER (WHERE COALESCE(au."isSandbox", false) = false)::int as participants,
          COALESCE(BOOL_OR(a."userId" = $1), false) as is_registered
        FROM "TryOut" t
        LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
        LEFT JOIN "user" au ON au.id = a."userId"
        WHERE t."isPublic" = true
          ${curationFilter}
        GROUP BY t.id, t.title, t.code, t.batch, t."solutionPrice", t."isPublic", t."scheduledStart", t."scheduledEnd"
        ORDER BY t."scheduledStart" DESC NULLS LAST
      `
      : `
        SELECT
          t.id,
          t.title,
          t.code,
          t.batch,
          t."solutionPrice",
          t."isPublic",
          ${TRYOUT_SCHEDULE},
          COUNT(DISTINCT a.id) FILTER (WHERE COALESCE(au."isSandbox", false) = false)::int as participants,
          false as is_registered
        FROM "TryOut" t
        LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
        LEFT JOIN "user" au ON au.id = a."userId"
        WHERE t."isPublic" = true
          ${curationFilter}
        GROUP BY t.id, t.title, t.code, t.batch, t."solutionPrice", t."isPublic", t."scheduledStart", t."scheduledEnd"
        ORDER BY t."scheduledStart" DESC NULLS LAST
      `;

    const values = user?.id ? [user.id] : [];
    const { rows } = await pool.query(query, values);

    const attemptsByTryout = new Map<string, AttemptSummaryRow[]>();
    const subtestsByTryout = new Map<
      string,
      Array<{ order: number; durationMinutes: number }>
    >();

    if (user?.id && rows.length > 0) {
      const tryoutIds = rows.map((r) => String(r.id));
      const [attemptRes, subtestRes] = await Promise.all([
        pool.query<AttemptSummaryRow & { tryOutId: string }>(
          `SELECT id, try_out_id AS "tryOutId", status, total_score AS "totalScore",
                  ${ATTEMPT_TIMESTAMPS}, current_subtest_order AS "currentSubtestOrder"
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

      for (const a of attemptRes.rows) {
        const list = attemptsByTryout.get(String(a.tryOutId)) || [];
        list.push(a);
        attemptsByTryout.set(String(a.tryOutId), list);
      }

      for (const s of subtestRes.rows) {
        const list = subtestsByTryout.get(String(s.tryOutId)) || [];
        list.push({
          order: Number(s.order),
          durationMinutes: Number(s.durationMinutes) || 0,
        });
        subtestsByTryout.set(String(s.tryOutId), list);
      }
    }

    const toFinishIds: string[] = [];
    const result = rows.map((t, idx) => {
      const tryoutId = String(t.id);
      const userAttempts = attemptsByTryout.get(tryoutId) || [];
      const latestAttempt = userAttempts[0] ?? null;
      const latestFinished =
        userAttempts.find((a) => a.status === "FINISHED") ?? null;
      const progress = user?.id
        ? computeAttemptProgress(
            tryoutId,
            latestAttempt,
            latestFinished,
            subtestsByTryout.get(tryoutId) || [],
            t.scheduledEnd,
          )
        : null;

      if (progress?.needAutoFinish && latestAttempt?.id) {
        toFinishIds.push(String(latestAttempt.id));
      }

      return {
        id: t.id,
        title: t.title,
        number:
          t.code != null ? String(t.code) : String(idx + 1).padStart(2, "0"),
        canEdit: false,
        participants: Number(t.participants) || 0,
        badge: t.batch || "SNBT",
        solutionPrice: Number(t.solutionPrice) || 0,
        isPublic: Boolean(t.isPublic),
        scheduledStart: t.scheduledStart
          ? new Date(t.scheduledStart).toISOString()
          : null,
        scheduledEnd: t.scheduledEnd
          ? new Date(t.scheduledEnd).toISOString()
          : null,
        isRegistered: Boolean(t.is_registered),
        latestAttemptStatus: progress?.status ?? null,
        latestAttemptId: progress?.latestAttemptId ?? null,
        latestFinishedAttemptId: progress?.latestFinishedAttemptId ?? null,
        resumeUrl: progress?.resumeUrl ?? null,
        isWaitingTransition: progress?.isWaitingTransition ?? false,
        nextSubtestOrder: progress?.nextSubtestOrder ?? null,
      };
    });

    if (toFinishIds.length > 0) {
      await triggerAutoFinishIfNeeded(
        toFinishIds,
        request.headers.get("authorization"),
      );
      const refreshed = await pool.query(
        `SELECT id, status FROM "TryOutAttempt" WHERE "userId" = $1 AND id = ANY($2::text[])`,
        [user?.id, toFinishIds],
      );
      const finishedIds = new Set(
        refreshed.rows.filter((row) => row.status === "FINISHED").map((row) => String(row.id)),
      );
      for (const item of result) {
        if (item.latestAttemptId && finishedIds.has(item.latestAttemptId)) {
          item.latestAttemptStatus = "FINISHED";
          item.latestFinishedAttemptId = item.latestAttemptId;
        }
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/proxy/tryout error:", err);
    return NextResponse.json(
      { message: "Gagal mengambil data tryout" },
      { status: 500 },
    );
  }
}
