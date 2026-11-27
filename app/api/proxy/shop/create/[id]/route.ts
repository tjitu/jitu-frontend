import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDbPool } from '@/lib/db';
import { getAuthenticatedAppUser } from '@/lib/server-auth';
import { createQrisTransaction, getMidtransConfig } from '@/lib/midtrans-server';
import { createFreePayment } from '@/lib/free-voucher-payment';
import { CheckoutError, getShopPackage, priceVoucher } from '@/lib/shop-pricing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) return NextResponse.json({ message: 'Silakan masuk akun terlebih dahulu.' }, { status: 401 });
    const pool = getDbPool();
    const { id } = await context.params;
    const pkg = await getShopPackage(pool,id);
    const body = await req.json().catch(() => ({})) as { voucherCode?: string };
    const rawCode = String(body.voucherCode || req.nextUrl.searchParams.get('voucher_code') || '').trim();
    const pending = await pool.query<{ id: string; createdAt: string }>(`SELECT id,"createdAt" FROM "Payment"
      WHERE "userId"=$1 AND status='PENDING' ORDER BY "createdAt" DESC LIMIT 1`,[user.id]);
    if (pending.rows[0]) {
      if (Date.now() - new Date(pending.rows[0].createdAt).getTime() <= 15*60*1000) return NextResponse.json({
        code: 'PENDING_PAYMENT', message: 'Selesaikan pembayaran sebelumnya sebelum membeli paket lain.', pendingTransactionId: pending.rows[0].id,
      },{ status: 409 });
      await pool.query(`UPDATE "Payment" SET status='CANCELLED',"updatedAt"=NOW() WHERE id=$1 AND status='PENDING'`,[pending.rows[0].id]);
    }
    const paymentId = randomUUID();
    const voucher = rawCode ? await priceVoucher(pool,rawCode,pkg.price,paymentId) : null;
    const finalPrice = voucher?.finalPrice ?? pkg.price;
    const discountAmount = voucher?.discountAmount ?? 0;
    const voucherId = voucher?.voucherId ?? null;
    const appliedVoucherCode = voucher?.code ?? null;
    const orderId = `ORDER-${randomUUID()}`;
    if (finalPrice === 0) {
      await createFreePayment(pool,{ paymentId,userId: user.id,packageId: pkg.id,packageName: pkg.name,
        orderId,price: pkg.price,discount: discountAmount,voucherId,voucherCode: appliedVoucherCode,
        tokenAmount: pkg.tokenAmount,affiliateCheckoutId: voucher?.affiliateCheckoutId ?? null });
      return NextResponse.json({ transactionId: paymentId,orderId,amount: 0,originalAmount: pkg.price,
        discountAmount,voucherCode: appliedVoucherCode,tokenAmount: pkg.tokenAmount,status: 'CONFIRMED',paymentMethod: 'FREE_VOUCHER',packageName: pkg.name });
    }
    // Persist before contacting the gateway so early webhooks resolve the order.
    await pool.query(`INSERT INTO "Payment" (id,"userId","tokenPackageId","orderId",amount,"originalAmount","discountAmount",
      "voucherId","voucherCode","tokenAmount",status,"paymentMethod","affiliateCheckoutId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING','QRIS',$11,NOW(),NOW())`,
      [paymentId,user.id,pkg.id,orderId,finalPrice,pkg.price,discountAmount,voucherId,appliedVoucherCode,pkg.tokenAmount,voucher?.affiliateCheckoutId ?? null]);
    let qris;
    try {
      qris = await createQrisTransaction({ orderId,grossAmount: finalPrice,checkoutTiming: voucher?.checkoutTiming,
        itemDetails: [{ id: pkg.id,price: finalPrice,quantity: 1,name: pkg.name.slice(0,50) }],
        customerDetails: { first_name: user.email.split('@')[0],email: user.email } });
    } catch (error) {
      await pool.query(`UPDATE "Payment" SET status='CANCELLED',"updatedAt"=NOW() WHERE id=$1 AND status='PENDING'`,[paymentId]);
      throw error;
    }
    const metadata = { redirect_url: qris.redirect_url,qr_code_url: qris.qr_url,qr_string: qris.qr_string,
      package_name: pkg.name,original_amount: pkg.price,discount_amount: discountAmount,voucher_code: appliedVoucherCode,created_via: 'web_snap_gopay' };
    await pool.query(`UPDATE "Payment" SET "snapToken"=$2,metadata=COALESCE(metadata,'{}'::jsonb)||$3::jsonb,"updatedAt"=NOW() WHERE id=$1`,
      [paymentId,qris.token,JSON.stringify(metadata)]);
    return NextResponse.json({ transactionId: paymentId,orderId,amount: finalPrice,originalAmount: pkg.price,discountAmount,
      voucherCode: appliedVoucherCode,tokenAmount: pkg.tokenAmount,status: 'PENDING',paymentMethod: 'QRIS',snapToken: qris.token,
      clientKey: getMidtransConfig().clientKey,redirectUrl: qris.redirect_url,qrCodeUrl: qris.qr_url,qrCode: qris.qr_string,
      expiryTime: voucher?.checkoutExpiresAt ?? qris.expiry_time,packageName: pkg.name });
  } catch (error) {
    return NextResponse.json({ message: error instanceof CheckoutError ? error.message : 'Gagal membuat transaksi QRIS.' },
      { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
