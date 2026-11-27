import { NextRequest, NextResponse } from "next/server";
import {
  verifyMidtransSignature,
  confirmPaymentInDb,
  getMidtransConfig,
  getMidtransStatus,
} from "@/lib/midtrans-server";
import { getDbPool } from "@/lib/db";
import { reconcileAffiliateRefund } from '@/lib/affiliate-refund';

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
      transaction_status,
      fraud_status,
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

    if (!isValid) {
      console.warn("Invalid Midtrans signature for order:", order_id);
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const verified = await getMidtransStatus(order_id);
    if (await reconcileAffiliateRefund(order_id,verified)) return NextResponse.json({ status: 'OK' });
    const txStatus = verified.transaction_status || '';
    const fStatus = verified.fraud_status || '';

    if (
      (txStatus === "settlement" || txStatus === "capture") &&
      fStatus !== "deny" &&
      fStatus !== "challenge"
    ) {
      await confirmPaymentInDb(order_id, verified);
    } else if (
      txStatus === "expire" ||
      txStatus === "cancel" ||
      txStatus === "deny" ||
      fStatus === "deny"
    ) {
      const pool = getDbPool();
      await pool.query(
        `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW(),metadata=COALESCE(metadata,'{}'::jsonb)||'{"affiliate_terminal":true}'::jsonb WHERE "orderId" = $1 AND status != 'CONFIRMED'`,
        [order_id]
      );
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (err: unknown) {
    console.error("Midtrans notification webhook error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
