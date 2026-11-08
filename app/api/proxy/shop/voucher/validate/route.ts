import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

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
  "f5f69e7c-9a5f-4214-917e-213a3cb000d9": { name: "PTN Premium Pass", tokenAmount: 4, price: 55000 },
};

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedAppUser(req);
    if (!user) {
      return NextResponse.json(
        { valid: false, message: "Silakan masuk akun terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawCode = String(body.code || "").trim().toUpperCase();
    const packageId = String(body.packageId || "").trim();

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, message: "Kode voucher / referal wajib diisi." },
        { status: 400 }
      );
    }

    if (!packageId) {
      return NextResponse.json(
        { valid: false, message: "Paket koin wajib dipilih." },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    // 1. Find package
    let pkgPrice = 0;
    const pkgRes = await pool.query(
      `SELECT id, name, price FROM "TokenPackage" WHERE id = $1 LIMIT 1`,
      [packageId]
    ).catch(() => ({ rows: [] }));

    if (pkgRes.rows.length > 0) {
      pkgPrice = Number(pkgRes.rows[0].price);
    } else if (FALLBACK_PACKAGES[packageId]) {
      pkgPrice = FALLBACK_PACKAGES[packageId].price;
    } else {
      return NextResponse.json(
        { valid: false, message: "Paket koin tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Query Voucher
    const voucherRes = await pool.query(
      `SELECT id, code, "discountPercent", "maxDiscount", "minPurchase", "maxUsage", "usedCount", "isActive", "expiresAt", description, "referrerName"
       FROM "Voucher"
       WHERE code = $1 LIMIT 1`,
      [rawCode]
    ).catch(() => ({ rows: [] }));

    if (voucherRes.rows.length === 0) {
      return NextResponse.json(
        { valid: false, message: "Kode voucher / referal tidak ditemukan." },
        { status: 404 }
      );
    }

    const voucher = voucherRes.rows[0];

    if (!voucher.isActive) {
      return NextResponse.json(
        { valid: false, message: "Kode voucher / referal ini sudah tidak aktif." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (voucher.expiresAt && new Date(voucher.expiresAt) < now) {
      return NextResponse.json(
        { valid: false, message: "Kode voucher / referal ini sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    if (voucher.maxUsage !== null && voucher.maxUsage !== undefined && Number(voucher.usedCount) >= Number(voucher.maxUsage)) {
      return NextResponse.json(
        { valid: false, message: "Kuota penggunaan kode voucher ini sudah habis." },
        { status: 400 }
      );
    }

    const minPurchase = Number(voucher.minPurchase || 0);
    if (minPurchase > 0 && pkgPrice < minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimal pembelian untuk kode ini adalah Rp ${minPurchase.toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    // 3. Calculate discount
    const discountPercent = Number(voucher.discountPercent);
    let discountAmount = Math.round((pkgPrice * discountPercent) / 100);
    const maxDiscount = voucher.maxDiscount ? Number(voucher.maxDiscount) : null;
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
    const finalPrice = Math.max(0, pkgPrice - discountAmount);

    return NextResponse.json({
      valid: true,
      voucherId: voucher.id,
      code: voucher.code,
      discountPercent,
      discountAmount,
      originalPrice: pkgPrice,
      finalPrice,
      description: voucher.description || `Diskon ${discountPercent}%`,
      referrerName: voucher.referrerName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, message: error.message || "Gagal memvalidasi kode voucher." },
      { status: 500 }
    );
  }
}
