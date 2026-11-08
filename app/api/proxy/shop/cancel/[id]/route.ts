import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { cancelMidtransTransaction } from "@/lib/midtrans-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: paymentId } = await context.params;
    const pool = getDbPool();

    const res = await pool.query(
      `SELECT id, "orderId", status FROM "Payment" WHERE id = $1 AND "userId" = $2 LIMIT 1`,
      [paymentId, user.id]
    );

    const payment = res.rows[0];
    if (!payment) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    if (payment.status === "PENDING") {
      await pool.query(
        `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE id = $1`,
        [payment.id]
      );
      if (payment.orderId) {
        cancelMidtransTransaction(payment.orderId).catch(() => {});
      }
    }

    return NextResponse.json(
      { success: true, message: "Transaksi berhasil dibatalkan." },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membatalkan transaksi.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
