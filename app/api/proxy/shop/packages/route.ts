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
    // Try to join with Discount if the Discount table exists
    let res;
    try {
      res = await pool.query(
        `SELECT p.id, p.name, p."tokenAmount", p.price, p."isActive",
                d.id AS "discountId", d.name AS "discountName", d.type AS "discountType",
                d.value AS "discountValue", d."badgeText", d."badgeStyle"
         FROM "TokenPackage" p
         LEFT JOIN "Discount" d ON (
           (d."packageId" = p.id OR d."packageId" IS NULL)
           AND d."isActive" = true
           AND d."startDate" <= NOW()
           AND d."endDate" >= NOW()
         )
         WHERE p."isActive" = true
         ORDER BY p.price ASC`
      );
    } catch {
      // Fallback if Discount table does not exist yet
      res = await pool.query(
        `SELECT id, name, "tokenAmount", price, "isActive"
         FROM "TokenPackage"
         WHERE "isActive" = true
         ORDER BY price ASC`
      );
    }

    if (res.rows.length > 0) {
      // If any discount is active, calculate discounted price
      const packages = res.rows.map((row: any) => {
        if (row.discountId && row.discountValue) {
          const originalPrice = row.price;
          let finalPrice = row.price;
          if (row.discountType === 'PERCENTAGE') {
            finalPrice = Math.max(1000, Math.round(row.price * (1 - Number(row.discountValue) / 100)));
          } else if (row.discountType === 'FIXED') {
            finalPrice = Math.max(1000, row.price - Number(row.discountValue));
          }
          return {
            id: row.id,
            name: row.name,
            tokenAmount: row.tokenAmount,
            price: finalPrice,
            originalPrice,
            discountId: row.discountId,
            discountName: row.discountName,
            badgeText: row.badgeText,
            badgeStyle: row.badgeStyle,
            isActive: row.isActive,
          };
        }
        return {
          id: row.id,
          name: row.name,
          tokenAmount: row.tokenAmount,
          price: row.price,
          isActive: row.isActive,
        };
      });

      return NextResponse.json(packages, { status: 200 });
    }

    return NextResponse.json(FALLBACK_PACKAGES, { status: 200 });
  } catch (err) {
    console.warn("GET /api/proxy/shop/packages error, using fallback:", err);
    return NextResponse.json(FALLBACK_PACKAGES, { status: 200 });
  }
}
