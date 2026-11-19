import crypto from "crypto";
import type { Pool } from "pg";

export async function createFreePayment(pool: Pool, input: {
  paymentId: string;
  userId: string;
  packageId: string;
  packageName: string;
  orderId: string;
  price: number;
  discount: number;
  voucherId: string | null;
  voucherCode: string | null;
  tokenAmount: number;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (input.voucherId) {
      const voucher = await client.query(
        `SELECT "discountPercent", "maxDiscount", "minPurchase", "maxUsage", "usedCount", "isActive", "expiresAt"
         FROM "Voucher" WHERE id = $1 FOR UPDATE`,
        [input.voucherId],
      );
      const v = voucher.rows[0];
      const percentageDiscount = v ? Math.round(input.price * Number(v.discountPercent) / 100) : 0;
      const actualDiscount = v?.maxDiscount ? Math.min(percentageDiscount, Number(v.maxDiscount)) : percentageDiscount;
      if (!v || !v.isActive || (v.expiresAt && new Date(v.expiresAt) < new Date())
          || (v.maxUsage != null && Number(v.usedCount) >= Number(v.maxUsage))
          || Number(v.minPurchase || 0) > input.price
          || actualDiscount !== input.discount || actualDiscount < input.price) {
        throw new Error("Voucher sudah berubah atau kuotanya habis. Periksa kode dan coba lagi.");
      }
      await client.query(`UPDATE "Voucher" SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW() WHERE id = $1`, [input.voucherId]);
    }
    await client.query(
      `INSERT INTO "Payment" (id, "userId", "tokenPackageId", "orderId", amount, "originalAmount", "discountAmount", "voucherId", "voucherCode", "tokenAmount", status, "paymentMethod", "createdAt", "updatedAt", metadata)
       VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'CONFIRMED', 'FREE_VOUCHER', NOW(), NOW(), $10)`,
      [input.paymentId, input.userId, input.packageId, input.orderId, input.price, input.discount,
        input.voucherId, input.voucherCode, input.tokenAmount,
        JSON.stringify({ package_name: input.packageName, created_via: "free_voucher" })],
    );
    if (input.packageName.toLowerCase().includes("pass")) {
      await client.query(
        `UPDATE "user" SET "tokenBalance" = "tokenBalance" + $1, "isPremium" = true,
         "premiumExpiresAt" = GREATEST(COALESCE("premiumExpiresAt", NOW()), NOW()) + INTERVAL '30 days',
         "updatedAt" = NOW() WHERE id = $2`,
        [input.tokenAmount, input.userId],
      );
    } else {
      await client.query(
        `UPDATE "user" SET "tokenBalance" = "tokenBalance" + $1, "updatedAt" = NOW() WHERE id = $2`,
        [input.tokenAmount, input.userId],
      );
    }
    await client.query(
      `INSERT INTO "TokenTransaction" (id, "userId", amount, type, "referenceId", "createdAt")
       VALUES ($1, $2, $3, 'PURCHASE_PACKAGE', $4, NOW())`,
      [crypto.randomUUID(), input.userId, input.tokenAmount, input.paymentId],
    );
    if (input.voucherId) {
      await client.query(
        `INSERT INTO "VoucherUsage" (id, "voucherId", "userId", "paymentId", discount, "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [crypto.randomUUID(), input.voucherId, input.userId, input.paymentId, input.discount],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
