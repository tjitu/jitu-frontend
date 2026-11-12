import { NextRequest, NextResponse } from "next/server";
import {
  verifyMidtransSignature,
  confirmPaymentInDb,
  getMidtransConfig,
  getMidtransStatus,
} from "@/lib/midtrans-server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      merchant_id,
    } = notification;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const config = getMidtransConfig();

    // Verify merchant ID if provided
    if (merchant_id && config.merchantId && merchant_id !== config.merchantId) {
      console.warn("Webhook merchant_id mismatch:", merchant_id, "expected:", config.merchantId);
      return NextResponse.json({ message: "Invalid merchant ID" }, { status: 400 });
    }

    // Verify SHA-512 signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    // Some merchant accounts use a separate Signature Secret Key. When the
    // server key signature does not match, verify the order with Midtrans's
    // authenticated status API before acting on the webhook.
    let verifiedStatus = notification;
    if (!isValid) {
      const status = await getMidtransStatus(order_id);
      if (
        !status ||
        status.order_id !== order_id ||
        (status.merchant_id && status.merchant_id !== config.merchantId) ||
        Number(status.gross_amount) !== Number(gross_amount)
      ) {
        console.warn("Unverifiable Midtrans notification for order:", order_id);
        return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
      }
      verifiedStatus = status;
    }

    const txStatus = verifiedStatus.transaction_status || "";
    const fStatus = verifiedStatus.fraud_status || "";

    if (
      (txStatus === "settlement" || txStatus === "capture") &&
      fStatus !== "deny" &&
      fStatus !== "challenge"
    ) {
      await confirmPaymentInDb(order_id, verifiedStatus);
      console.log(`Payment ${order_id} successfully confirmed via webhook!`);
    } else if (
      txStatus === "expire" ||
      txStatus === "cancel" ||
      txStatus === "deny" ||
      fStatus === "deny"
    ) {
      const pool = getDbPool();
      await pool.query(
        `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE "orderId" = $1 AND status != 'CONFIRMED'`,
        [order_id]
      ).catch(() => {});
      console.log(`Payment ${order_id} marked as CANCELLED via webhook.`);
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (err: unknown) {
    console.error("Midtrans notification webhook error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
