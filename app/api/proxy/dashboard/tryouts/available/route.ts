import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query(`
      SELECT 
        id, 
        title, 
        description, 
        COALESCE("solutionPrice", 8900) as "solutionPrice", 
        "isPublic", 
        "scheduledStart", 
        "createdAt",
        0 as participants
      FROM "TryOut"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/proxy/dashboard/tryouts/available error:", err);
    return NextResponse.json([]);
  }
}
