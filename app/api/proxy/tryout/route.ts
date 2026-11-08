import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(request).catch(() => null);
    const pool = getDbPool();

    const query = user?.id
      ? `
        SELECT
          t.id,
          t.title,
          t.code,
          t.batch,
          t."solutionPrice",
          t."isPublic",
          t."scheduledStart",
          t."scheduledEnd",
          COUNT(DISTINCT a.id)::int as participants,
          COALESCE(BOOL_OR(a."userId" = $1), false) as is_registered
        FROM "TryOut" t
        LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
        WHERE t."isPublic" = true
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
          t."scheduledStart",
          t."scheduledEnd",
          COUNT(DISTINCT a.id)::int as participants,
          false as is_registered
        FROM "TryOut" t
        LEFT JOIN "TryOutAttempt" a ON a.try_out_id = t.id
        WHERE t."isPublic" = true
        GROUP BY t.id, t.title, t.code, t.batch, t."solutionPrice", t."isPublic", t."scheduledStart", t."scheduledEnd"
        ORDER BY t."scheduledStart" DESC NULLS LAST
      `;

    const values = user?.id ? [user.id] : [];
    const { rows } = await pool.query(query, values);

    const result = rows.map((t, idx) => ({
      id: t.id,
      title: t.title,
      number: t.code != null ? String(t.code) : String(idx + 1).padStart(2, "0"),
      canEdit: false,
      participants: Number(t.participants) || 0,
      badge: t.batch || "SNBT",
      solutionPrice: Number(t.solutionPrice) || 0,
      isPublic: Boolean(t.isPublic),
      scheduledStart: t.scheduledStart ? new Date(t.scheduledStart).toISOString() : null,
      scheduledEnd: t.scheduledEnd ? new Date(t.scheduledEnd).toISOString() : null,
      isRegistered: Boolean(t.is_registered),
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/proxy/tryout error:", err);
    return NextResponse.json(
      { message: "Gagal mengambil data tryout" },
      { status: 500 }
    );
  }
}
