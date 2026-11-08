import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `SELECT p.id, p."tokenAmount" as amount, 'PURCHASE' as type, p."orderId" as "referenceId",
              p."createdAt", p."userId", p.amount as "totalPrice",
              COALESCE(tp.name, 'Paket Koin') as "packageName"
       FROM "Payment" p
       LEFT JOIN "TokenPackage" tp ON p."tokenPackageId" = tp.id
       WHERE p."userId" = $1 AND p.status = 'PENDING'
       ORDER BY p."createdAt" DESC`,
      [user.id]
    ).catch(() => ({ rows: [] }));

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/proxy/shop/pending error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
