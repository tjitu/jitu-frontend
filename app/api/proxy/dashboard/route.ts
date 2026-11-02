import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ tokenBalance: 0 }, { status: 200 });
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT "tokenBalance" FROM "user" WHERE id = $1`,
      [session.user.id]
    );

    const tokenBalance = rows[0]?.tokenBalance ?? 0;
    return NextResponse.json({ tokenBalance }, { status: 200 });
  } catch (err) {
    console.error("GET /api/proxy/dashboard error:", err);
    return NextResponse.json({ tokenBalance: 0 }, { status: 200 });
  }
}
