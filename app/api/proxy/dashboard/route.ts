import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(req);

    if (!user) {
      return NextResponse.json({ tokenBalance: 0 }, { status: 200 });
    }

    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT "tokenBalance" FROM "user" WHERE id = $1`,
      [user.id]
    );

    const tokenBalance = rows[0]?.tokenBalance ?? 0;
    return NextResponse.json({ tokenBalance }, { status: 200 });
  } catch (err) {
    console.error("GET /api/proxy/dashboard error:", err);
    return NextResponse.json({ tokenBalance: 0 }, { status: 200 });
  }
}

