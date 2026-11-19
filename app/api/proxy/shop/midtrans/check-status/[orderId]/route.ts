import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getMidtransStatus, confirmPaymentInDb } from "@/lib/midtrans-server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { orderId } = await context.params;
    if (!orderId) {
      return NextResponse.json({ message: "Order ID required" }, { status: 400 });
    }

    const pool = getDbPool();
    const payment = await pool.query(
      `SELECT id FROM "Payment" WHERE "orderId" = $1 AND "userId" = $2 LIMIT 1`,
      [orderId, user.id]
    );
    if (!payment.rows[0]) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }
    const midtransData = await getMidtransStatus(orderId);
    if (!midtransData) {
      return NextResponse.json(
        { status: "PENDING", message: "Transaksi masih menunggu pembayaran." },
        { status: 200 }
      );
    }

    const txStatus = midtransData.transaction_status || "";
    const fraudStatus = midtransData.fraud_status || "";

    if (
      (txStatus === "settlement" || txStatus === "capture") &&
      fraudStatus !== "deny" &&
      fraudStatus !== "challenge"
    ) {
      const confirmRes = await confirmPaymentInDb(orderId, midtransData);
      return NextResponse.json(
        {
          status: "CONFIRMED",
          success: true,
          message: "Pembayaran berhasil dikonfirmasi!",
          payment: confirmRes.payment,
        },
        { status: 200 }
      );
    }

    if (
      txStatus === "expire" ||
      txStatus === "cancel" ||
      txStatus === "deny" ||
      fraudStatus === "deny"
    ) {
      const result = await pool.query(
        `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE "orderId" = $1 AND status != 'CONFIRMED' RETURNING status`,
        [orderId]
      );
      if (!result.rowCount) {
        return NextResponse.json({ status: "CONFIRMED", success: true }, { status: 200 });
      }

      return NextResponse.json(
        { status: "CANCELLED", success: false, message: "Transaksi telah kedaluwarsa atau dibatalkan." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: "PENDING", success: false, message: "Menunggu pembayaran..." },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking status";
    console.error("check-status error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
