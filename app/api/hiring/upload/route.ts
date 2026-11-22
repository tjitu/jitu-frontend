import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// CV uploads are no longer accepted. Applicants submit a CV link instead, and the
// old handler let anonymous callers write files into the public web root.
export async function POST() {
  return NextResponse.json(
    { message: "CV upload is no longer available." },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
