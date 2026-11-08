import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { createSnapTransaction } from "@/lib/midtrans-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  "f5f69e7c-9a5f-4214-917e-213a3cb000d9": { name: "PTN Premium Pass", tokenAmount: 1000, price: 55000 },
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
            redirectUrl: meta.redirect_url,
            expiryTime: new Date(new Date(existing.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
            packageName: pkg.name,
          },
          { status: 200 }
        );
      }
    }

    // 3. Create unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Request Midtrans Snap Transaction
    const snapResult = await createSnapTransaction({
      orderId,
      grossAmount: pkg.price,
      itemDetails: [
        {
          id: pkg.id,
          price: pkg.price,
          quantity: 1,
          name: pkg.name,
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
      redirect_url: snapResult.redirect_url,
      package_name: pkg.name,
      created_via: "web_snap",
    };

    // If packageId is an ad-hoc key, ensure we link safely or insert
    await pool.query(
      `INSERT INTO "Payment" (id, "userId", "tokenPackageId", "orderId", amount, "tokenAmount", status, "paymentMethod", "snapToken", "createdAt", "updatedAt", metadata)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', 'QRIS', $7, NOW(), NOW(), $8)`,
      [
        paymentId,
        user.id,
        pkg.id,
        orderId,
        pkg.price,
        pkg.tokenAmount,
        snapResult.token,
        JSON.stringify(metadata),
      ]
    );

    const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        transactionId: paymentId,
        orderId,
        amount: pkg.price,
        tokenAmount: pkg.tokenAmount,
        status: "PENDING",
        paymentMethod: "QRIS",
        snapToken: snapResult.token,
        redirectUrl: snapResult.redirect_url,
        expiryTime,
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
