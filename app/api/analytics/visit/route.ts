import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    "postgresql://postgres.oyyhjyyadrsviehamztc:JituPes13DbM3l3tusyyy@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  return url;
}

let poolInstance: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new pg.Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    poolInstance.on("error", () => {
      try {
        poolInstance?.end().catch(() => {});
      } catch {}
      poolInstance = null;
    });
  }
  return poolInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPath = typeof body.path === "string" ? body.path.trim() : "/";
    const path = rawPath.startsWith("/") ? rawPath.split("?")[0] : `/${rawPath}`;
    const visitorId =
      typeof body.visitorId === "string" && body.visitorId.trim().length > 0
        ? body.visitorId.trim().slice(0, 100)
        : "anon";
    const durationSec =
      typeof body.durationSec === "number" && Number.isFinite(body.durationSec)
        ? Math.max(0, Math.min(86400, Math.round(body.durationSec)))
        : 0;
    const visitId =
      typeof body.visitId === "string" && body.visitId.trim().length > 0
        ? body.visitId.trim().slice(0, 100)
        : randomUUID();

    const pool = getPool();
    await pool.query(
      `INSERT INTO public.page_visit_events (id, path, visitor_id, duration_sec, visited_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         duration_sec = GREATEST(public.page_visit_events.duration_sec, EXCLUDED.duration_sec)`,
      [visitId, path, visitorId, durationSec]
    );

    return NextResponse.json({ ok: true, visitId });
  } catch (error) {
    console.warn("POST /api/analytics/visit error:", (error as Error)?.message);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

