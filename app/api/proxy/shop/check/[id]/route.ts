import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getMidtransStatus, confirmPaymentInDb } from "@/lib/midtrans-server";

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

    const { id } = await context.params;
    const pool = getDbPool();

    // Find payment record by ID or orderId
    const res = await pool.query(
      `SELECT id, "orderId", status, "snapToken", metadata FROM "Payment" WHERE (id = $1 OR "orderId" = $1) AND "userId" = $2 LIMIT 1`,
      [id, user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
    }

    const payment = res.rows[0];
    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ status: "CONFIRMED" });
    }

    // Check with Midtrans status API
    try {
      const midtransData = await getMidtransStatus(payment.orderId);
      if (!midtransData) {
        return NextResponse.json({ status: payment.status });
      }
      const transactionStatus = midtransData.transaction_status;
      const fraudStatus = midtransData.fraud_status;
      const qrCodeUrl = Array.isArray(midtransData.actions)
        ? midtransData.actions.find(
            (action: { name?: string; url?: string }) =>
              action.name === "generate-qr-code",
          )?.url
        : undefined;

      let newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" = "PENDING";

      if (
        transactionStatus === "capture" ||
        transactionStatus === "settlement"
      ) {
        if (fraudStatus === "challenge") {
          newStatus = "PENDING";
        } else {
          newStatus = "CONFIRMED";
        }
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        newStatus = "CANCELLED";
      }

      if (newStatus === "CONFIRMED" && payment.status !== "CONFIRMED") {
        await confirmPaymentInDb(payment.orderId, midtransData);
      } else if (newStatus !== payment.status && newStatus !== "PENDING") {
        await pool.query(
          `UPDATE "Payment" SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
          [newStatus, payment.id]
        );
      }

      return NextResponse.json({ status: newStatus, qrCodeUrl });
    } catch {
      return NextResponse.json({ status: payment.status });
    }
  } catch (error) {
    console.error("POST /api/proxy/shop/check/[id] error:", error);
    return NextResponse.json({ status: "PENDING" });
  }
}
