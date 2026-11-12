import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { createQrisTransaction, getMidtransConfig } from "@/lib/midtrans-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const FALLBACK_PACKAGES: Record<
  string,
  { name: string; tokenAmount: number; price: number }
> = {
  "1a99923d-608c-46e9-87b6-01dff4d19daa": { name: "1 coin", tokenAmount: 1, price: 15000 },
  "1": { name: "1 coin", tokenAmount: 1, price: 15000 },
  "6f7a07c2-2080-4afe-9582-c9bfb88b438c": { name: "3 coin", tokenAmount: 3, price: 39000 },
  "2": { name: "3 coin", tokenAmount: 3, price: 39000 },
  "fc9e0493-4812-4165-8e60-9db89c436b31": { name: "5 coin", tokenAmount: 5, price: 59000 },
  "3": { name: "5 coin", tokenAmount: 5, price: 59000 },
  "10-coins-pack-best-value": { name: "10 coin", tokenAmount: 10, price: 89000 },
  "4": { name: "10 coin", tokenAmount: 10, price: 89000 },
  "f5f69e7c-9a5f-4214-917e-213a3cb000d9": { name: "PTN Premium Pass", tokenAmount: 4, price: 55000 },
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "Silakan masuk akun terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id: packageId } = await context.params;
    const pool = getDbPool();

    // 1. Find package
    let pkg: { id: string; name: string; tokenAmount: number; price: number } | null = null;
    const pkgRes = await pool.query(
      `SELECT id, name, "tokenAmount", price FROM "TokenPackage" WHERE id = $1 LIMIT 1`,
      [packageId]
    ).catch(() => ({ rows: [] }));

    if (pkgRes.rows.length > 0) {
      const row = pkgRes.rows[0];
      pkg = {
        id: row.id,
        name: row.name,
        tokenAmount: Number(row.tokenAmount),
        price: Number(row.price),
      };
    } else if (FALLBACK_PACKAGES[packageId]) {
      const fb = FALLBACK_PACKAGES[packageId];
      pkg = { id: packageId, name: fb.name, tokenAmount: fb.tokenAmount, price: fb.price };
    }

    if (!pkg) {
      return NextResponse.json(
        { message: "Paket koin tidak ditemukan." },
        { status: 404 }
      );
    }

    // Parse optional voucher / referral code
    const body = await req.json().catch(() => ({}));
    const rawVoucherCode = String(
      body?.voucherCode || req.nextUrl.searchParams.get("voucher_code") || ""
    ).trim().toUpperCase();

    let voucherId: string | null = null;
    let appliedVoucherCode: string | null = null;
    let discountAmount = 0;
    let finalPrice = pkg.price;

    if (rawVoucherCode) {
      const vRes = await pool.query(
        `SELECT id, code, "discountPercent", "maxDiscount", "minPurchase", "maxUsage", "usedCount", "isActive", "expiresAt"
         FROM "Voucher"
         WHERE code = $1 LIMIT 1`,
        [rawVoucherCode]
      ).catch(() => ({ rows: [] }));

      if (vRes.rows.length === 0) {
        return NextResponse.json(
          { message: "Kode voucher / referal tidak ditemukan." },
          { status: 400 }
        );
      }

      const v = vRes.rows[0];
      if (!v.isActive) {
        return NextResponse.json(
          { message: "Kode voucher / referal sudah tidak aktif." },
          { status: 400 }
        );
      }

      const now = new Date();
      if (v.expiresAt && new Date(v.expiresAt) < now) {
        return NextResponse.json(
          { message: "Kode voucher / referal sudah kedaluwarsa." },
          { status: 400 }
        );
      }

      if (v.maxUsage !== null && v.maxUsage !== undefined && Number(v.usedCount) >= Number(v.maxUsage)) {
        return NextResponse.json(
          { message: "Kuota penggunaan kode voucher ini sudah habis." },
          { status: 400 }
        );
      }

      const minPurchase = Number(v.minPurchase || 0);
      if (minPurchase > 0 && pkg.price < minPurchase) {
        return NextResponse.json(
          { message: `Minimal pembelian untuk kode ini adalah Rp ${minPurchase.toLocaleString("id-ID")}.` },
          { status: 400 }
        );
      }

      const discountPercent = Number(v.discountPercent);
      discountAmount = Math.round((pkg.price * discountPercent) / 100);
      const maxDiscount = v.maxDiscount ? Number(v.maxDiscount) : null;
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
      finalPrice = Math.max(0, pkg.price - discountAmount);
      voucherId = v.id;
      appliedVoucherCode = v.code;
    }

    // 2. Check for existing pending transaction for this user
    const pendingRes = await pool.query(
      `SELECT id, "orderId", "snapToken", metadata, "createdAt"
       FROM "Payment"
       WHERE "userId" = $1 AND status = 'PENDING'
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [user.id]
    ).catch(() => ({ rows: [] }));

    if (pendingRes.rows.length > 0) {
      const existing = pendingRes.rows[0];
      const ageMs = Date.now() - new Date(existing.createdAt).getTime();
      // If older than 15 minutes, cancel it
      if (ageMs > 15 * 60 * 1000) {
        await pool.query(
          `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE id = $1`,
          [existing.id]
        ).catch(() => {});
      } else {
        // Return existing active pending payment
        const meta = existing.metadata || {};
        return NextResponse.json(
          {
            transactionId: existing.id,
            orderId: existing.orderId,
            amount: pkg.price,
            tokenAmount: pkg.tokenAmount,
            status: "PENDING",
            paymentMethod: "QRIS",
            snapToken: existing.snapToken,
            clientKey: getMidtransConfig().clientKey,
            redirectUrl: meta.redirect_url,
            qrCodeUrl: meta.qr_code_url,
            qrCode: meta.qr_string,
            expiryTime: new Date(new Date(existing.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
            packageName: pkg.name,
          },
          { status: 200 }
        );
      }
    }

    // 3. Create unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // If 100% discount (free voucher): confirm immediately
    if (finalPrice === 0) {
      const paymentId = crypto.randomUUID();
      const isPass = pkg.name.toLowerCase().includes("pass");
      await pool.query(
        `INSERT INTO "Payment" (id, "userId", "tokenPackageId", "orderId", amount, "originalAmount", "discountAmount", "voucherId", "voucherCode", "tokenAmount", status, "paymentMethod", "createdAt", "updatedAt", metadata)
         VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'CONFIRMED', 'FREE_VOUCHER', NOW(), NOW(), $10)`,
        [
          paymentId,
          user.id,
          pkg.id,
          orderId,
          pkg.price,
          discountAmount,
          voucherId,
          appliedVoucherCode,
          pkg.tokenAmount,
          JSON.stringify({ package_name: pkg.name, created_via: "free_voucher" }),
        ]
      );

      if (isPass) {
        await pool.query(
          `UPDATE "user" SET "tokenBalance" = "tokenBalance" + $1, "isPremium" = true, "premiumExpiresAt" = NOW() + INTERVAL '30 days' WHERE id = $2`,
          [pkg.tokenAmount, user.id]
        );
      } else {
        await pool.query(
          `UPDATE "user" SET "tokenBalance" = "tokenBalance" + $1 WHERE id = $2`,
          [pkg.tokenAmount, user.id]
        );
      }

      if (voucherId) {
        await pool.query(
          `UPDATE "Voucher" SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW() WHERE id = $1`,
          [voucherId]
        ).catch(() => {});
        await pool.query(
          `INSERT INTO "VoucherUsage" (id, "voucherId", "userId", "paymentId", discount, "createdAt")
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [crypto.randomUUID(), voucherId, user.id, paymentId, discountAmount]
        ).catch(() => {});
      }

      return NextResponse.json(
        {
          transactionId: paymentId,
          orderId,
          amount: 0,
          originalAmount: pkg.price,
          discountAmount,
          voucherCode: appliedVoucherCode,
          tokenAmount: pkg.tokenAmount,
          status: "CONFIRMED",
          paymentMethod: "FREE_VOUCHER",
          packageName: pkg.name,
        },
        { status: 200 }
      );
    }

    // Prefer a direct GoPay charge so we can display Midtrans's borderless QR.
    // If Core API is unavailable for this merchant, the helper uses Snap.
    const qrisResult = await createQrisTransaction({
      orderId,
      grossAmount: finalPrice,
      itemDetails: [
        {
          id: pkg.id,
          price: finalPrice,
          quantity: 1,
          name: `${pkg.name}${discountAmount > 0 ? ` (${appliedVoucherCode})` : ""}`.slice(0, 50),
        },
      ],
      customerDetails: {
        first_name: user.email.split("@")[0],
        email: user.email,
      },
    });
    // 5. Insert record into Payment table
    const paymentId = crypto.randomUUID();
    const metadata = {
      redirect_url: qrisResult.redirect_url,
      qr_code_url: qrisResult.qr_url,
      qr_string: qrisResult.qr_string,
      package_name: pkg.name,
      original_amount: pkg.price,
      discount_amount: discountAmount,
      voucher_code: appliedVoucherCode,
      created_via: "web_snap_gopay",
    };

    await pool.query(
      `INSERT INTO "Payment" (id, "userId", "tokenPackageId", "orderId", amount, "originalAmount", "discountAmount", "voucherId", "voucherCode", "tokenAmount", status, "paymentMethod", "snapToken", "createdAt", "updatedAt", metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', 'QRIS', $11, NOW(), NOW(), $12)`,
      [
        paymentId,
        user.id,
        pkg.id,
        orderId,
        finalPrice,
        pkg.price,
        discountAmount,
        voucherId,
        appliedVoucherCode,
        pkg.tokenAmount,
        qrisResult.token,
        JSON.stringify(metadata),
      ]
    );

    return NextResponse.json(
      {
        transactionId: paymentId,
        orderId,
        amount: finalPrice,
        originalAmount: pkg.price,
        discountAmount,
        voucherCode: appliedVoucherCode || undefined,
        tokenAmount: pkg.tokenAmount,
        status: "PENDING",
        paymentMethod: "QRIS",
        snapToken: qrisResult.token,
        clientKey: getMidtransConfig().clientKey,
        redirectUrl: qrisResult.redirect_url,
        qrCodeUrl: qrisResult.qr_url,
        qrCode: qrisResult.qr_string,
        expiryTime: qrisResult.expiry_time,
        packageName: pkg.name,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat transaksi QRIS.";
    console.error("POST /api/proxy/shop/create/[id] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
