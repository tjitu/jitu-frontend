import { NextResponse } from "next/server";

// Pure liveness probe: no DB, no data fetching, no SSR render. Exists so uptime
// monitoring can check "is the web server up" without paying for a full
// homepage render (which the previous check used, and which pulls in fonts,
// analytics, and page data unrelated to server liveness).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
