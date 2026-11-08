import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json({ pending: null }, { status: 200 });
    }

    const pool = getDbPool();
    const res = await pool.query(
      `SELECT p.id, p."userId", p."tokenPackageId", p."orderId", p.amount, p."tokenAmount", p.status, p."paymentMethod", p."snapToken", p."createdAt", p.metadata,
              tp.name as "packageName"
       FROM "Payment" p
       LEFT JOIN "TokenPackage" tp ON p."tokenPackageId" = tp.id
       WHERE p."userId" = $1 AND p.status = 'PENDING'
       ORDER BY p."createdAt" DESC
       LIMIT 1`,
      [user.id]
    );

    const pending = res.rows[0];
    if (!pending) {
      return NextResponse.json({ pending: null }, { status: 200 });
    }

    // Check expiration (15 minutes)
    const createdAt = new Date(pending.createdAt).getTime();
    const expiryTime = createdAt + 15 * 60 * 1000;
    const isExpired = Date.now() > expiryTime;

    if (isExpired) {
      await pool.query(
        `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE id = $1`,
        [pending.id]
      ).catch(() => {});
      return NextResponse.json({ pending: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        pending: {
          ...pending,
          expiresAt: new Date(expiryTime).toISOString(),
          isExpired: false,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/proxy/shop/pending-payment error:", err);
    return NextResponse.json({ pending: null }, { status: 200 });
  }
}
