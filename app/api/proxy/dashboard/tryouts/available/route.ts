import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

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
             t."scheduledStart",
             t."scheduledEnd",
             t."createdAt",
             COUNT(DISTINCT a.id)::int AS participants,
             COALESCE(BOOL_OR(a."userId" = $1), false) AS "isRegistered"
           FROM "TryOut" t
           LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
           WHERE t."isPublic" = true
             AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'
             AND t."scheduledStart" > NOW()
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
             t."scheduledStart",
             t."scheduledEnd",
             t."createdAt",
             COUNT(DISTINCT a.id)::int AS participants,
             false AS "isRegistered"
           FROM "TryOut" t
           LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
           WHERE t."isPublic" = true
             AND COALESCE(t.curation_status, 'PUBLISHED') = 'PUBLISHED'
             AND t."scheduledStart" > NOW()
           GROUP BY t.id, t.title, t.description, t."solutionPrice", t."isPublic", t."isSpecial", t."scheduledStart", t."scheduledEnd", t."createdAt"
           ORDER BY t."scheduledStart" ASC NULLS LAST
           LIMIT 10`,
        );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/proxy/dashboard/tryouts/available error:", err);
    return NextResponse.json([]);
  }
}
