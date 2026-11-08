import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FALLBACK_PACKAGES = [
  { id: "1a99923d-608c-46e9-87b6-01dff4d19daa", name: "1 coin", tokenAmount: 1, price: 15000 },
  { id: "6f7a07c2-2080-4afe-9582-c9bfb88b438c", name: "3 coin", tokenAmount: 3, price: 39000 },
  { id: "fc9e0493-4812-4165-8e60-9db89c436b31", name: "5 coin", tokenAmount: 5, price: 59000 },
  { id: "10-coins-pack-best-value", name: "10 coin", tokenAmount: 10, price: 89000 },
  { id: "f5f69e7c-9a5f-4214-917e-213a3cb000d9", name: "PTN Premium Pass", tokenAmount: 4, price: 55000 },
];

export async function GET() {
  try {
    const pool = getDbPool();
    const res = await pool.query(
      `SELECT id, name, "tokenAmount", price, "isActive"
       FROM "TokenPackage"
       WHERE "isActive" = true
       ORDER BY price ASC`
    );

    if (res.rows.length > 0) {
      return NextResponse.json(res.rows, { status: 200 });
    }

    return NextResponse.json(FALLBACK_PACKAGES, { status: 200 });
  } catch (err) {
    console.warn("GET /api/proxy/shop/packages error, using fallback:", err);
    return NextResponse.json(FALLBACK_PACKAGES, { status: 200 });
  }
}
