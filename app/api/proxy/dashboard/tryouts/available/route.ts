import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { TRYOUT_SCHEDULE } from "@/lib/tryout-timing-sql";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { growthStatuses } from '@/lib/server/growth-statuses';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(request).catch(() => null);
    const pool = getDbPool();
    const { rows } = user?.id
      ? await pool.query(
          `SELECT
             t.id,
             t.title,
             t.description,
             COALESCE(t."solutionPrice", 0)::int AS "solutionPrice",
             t."isPublic",
             COALESCE(t."isSpecial", false) AS "isSpecial",
             ${TRYOUT_SCHEDULE},
             t."createdAt",
             COUNT(DISTINCT a.id) FILTER (WHERE COALESCE(au."isSandbox", false) = false)::int AS participants,
             COALESCE(BOOL_OR(a."userId" = $1), false) AS "isRegistered"
           FROM "TryOut" t
           LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
           LEFT JOIN "user" au ON au.id = a."userId"
           WHERE t."isPublic" = true
             AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'
             AND t."scheduledStart" > (NOW() AT TIME ZONE 'UTC')
           GROUP BY t.id, t.title, t.description, t."solutionPrice", t."isPublic", t."isSpecial", t."scheduledStart", t."scheduledEnd", t."createdAt"
           ORDER BY t."scheduledStart" ASC NULLS LAST
           LIMIT 10`,
          [user.id],
        )
      : await pool.query(
          `SELECT
             t.id,
             t.title,
             t.description,
             COALESCE(t."solutionPrice", 0)::int AS "solutionPrice",
             t."isPublic",
             COALESCE(t."isSpecial", false) AS "isSpecial",
             ${TRYOUT_SCHEDULE},
             t."createdAt",
             COUNT(DISTINCT a.id) FILTER (WHERE COALESCE(au."isSandbox", false) = false)::int AS participants,
             false AS "isRegistered"
           FROM "TryOut" t
           LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
           LEFT JOIN "user" au ON au.id = a."userId"
           WHERE t."isPublic" = true
             AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'
             AND t."scheduledStart" > (NOW() AT TIME ZONE 'UTC')
           GROUP BY t.id, t.title, t.description, t."solutionPrice", t."isPublic", t."isSpecial", t."scheduledStart", t."scheduledEnd", t."createdAt"
           ORDER BY t."scheduledStart" ASC NULLS LAST
           LIMIT 10`,
        );

    const statuses = await growthStatuses(pool, user?.id, rows.map(row => String(row.id)));
    return NextResponse.json(rows.map(row => ({ ...row, verificationStatus: statuses.get(String(row.id)) ?? null })));
  } catch (err) {
    console.error("GET /api/proxy/dashboard/tryouts/available error:", err);
    return NextResponse.json([]);
  }
}
