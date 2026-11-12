import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getMidtransConfig } from "@/lib/midtrans-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const pool = getDbPool();

    const res = await pool.query(
      `SELECT p.id, p."tokenAmount" as amount, 'PURCHASE' as type, p."orderId" as "referenceId",
              p."createdAt", p."userId", p.amount as "totalPrice", p."snapToken", p.metadata
       FROM "Payment" p
       WHERE (p.id = $1 OR p."orderId" = $1) AND p."userId" = $2
       LIMIT 1`,
      [id, user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const row = res.rows[0];
    const metadata = typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata || {});

    return NextResponse.json(
      {
        id: row.id,
        amount: row.amount,
        type: row.type,
        referenceId: row.referenceId,
        createdAt: row.createdAt,
        userId: row.userId,
        totalPrice: row.totalPrice,
        qris: metadata.qr_string || "",
        clientKey: getMidtransConfig().clientKey,
        metadata: {
          qr_code_url: metadata.qr_code_url,
          qr_string: metadata.qr_string,
          deeplink_url: metadata.deeplink_url,
          redirect_url: metadata.redirect_url,
          snap_token: row.snapToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/proxy/shop/data/[id] error:", error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}
