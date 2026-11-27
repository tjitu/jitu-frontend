import type { Pool } from 'pg';

export class CheckoutError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}
export interface ShopPackage { id: string; name: string; tokenAmount: number; price: number }
interface Voucher {
  id: string; code: string; discountPercent: number; maxDiscount: number | null;
  minPurchase: number; maxUsage: number | null; usedCount: number; isActive: boolean;
  expiresAt: string | null; description: string | null; referrerName: string | null;
}
interface AffiliateQuote { id: string; discountRate: number; paidAmount: number; discountAmount: number; createdAt: string; expiresAt: string }

export async function getShopPackage(pool: Pool, id: string): Promise<ShopPackage> {
  const { rows: [pkg] } = await pool.query<ShopPackage>(
    'SELECT id,name,"tokenAmount",price FROM "TokenPackage" WHERE id=$1 AND "isActive"=true', [id]);
  if (!pkg) throw new CheckoutError('Paket koin tidak ditemukan.',404);
  const discounts = await pool.query<{ type: string; value: number }>(`SELECT type,value FROM "Discount"
    WHERE "isActive"=true AND "startDate"<=NOW() AND "endDate">=NOW() AND ("packageId"=$1 OR "packageId" IS NULL)
    ORDER BY ("packageId" IS NULL),"createdAt" DESC LIMIT 1`,[id]).catch((error: unknown) => {
      if ((error as { code?: string }).code === '42P01') return { rows: [] };
      throw error;
    });
  const discount = discounts.rows[0];
  const price = Number(pkg.price);
  return { ...pkg, price: discount ? Math.max(1000, price - (discount.type === 'PERCENTAGE'
    ? Math.round(price * Number(discount.value) / 100) : Math.round(Number(discount.value)))) : price };
}

export async function priceVoucher(pool: Pool, rawCode: string, pkgPrice: number, reservationId?: string) {
  const code = rawCode.trim().toUpperCase();
  const { rows: [voucher] } = await pool.query<Voucher>('SELECT * FROM "Voucher" WHERE code=$1',[code]);
  if (!voucher) throw new CheckoutError('Kode voucher / referal tidak ditemukan.');
  if (!voucher.isActive) throw new CheckoutError('Kode voucher / referal sudah tidak aktif.');
  if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() <= Date.now()) throw new CheckoutError('Kode voucher / referal sudah kedaluwarsa.');
  if (voucher.maxUsage !== null && voucher.usedCount >= voucher.maxUsage) throw new CheckoutError('Kuota penggunaan kode voucher ini sudah habis.');
  if (pkgPrice < voucher.minPurchase) throw new CheckoutError(`Minimal pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')}.`);
  let affiliate: AffiliateQuote | null;
  try {
    const { rows } = await pool.query<{ quote: AffiliateQuote | null }>('SELECT affiliate_quote($1,$2,$3) AS quote',
      [voucher.id,pkgPrice,reservationId ?? null]);
    affiliate = rows[0].quote;
  } catch (error) {
    if ((error as { code?: string }).code === 'P0001') throw new CheckoutError('Referral afiliasi belum tersedia atau tidak memenuhi syarat. Silakan gunakan kode lain.');
    throw error;
  }
  let discountAmount = Math.round(pkgPrice * Number(voucher.discountPercent) / 100);
  if (voucher.maxDiscount) discountAmount = Math.min(discountAmount,Number(voucher.maxDiscount));
  discountAmount = affiliate?.discountAmount ?? discountAmount;
  const discountPercent = affiliate ? affiliate.discountRate / 100 : Number(voucher.discountPercent);
  return { valid: true, voucherId: voucher.id, code: voucher.code, discountPercent, discountAmount,
    originalPrice: pkgPrice, finalPrice: affiliate?.paidAmount ?? Math.max(0,pkgPrice-discountAmount),
    description: voucher.description || `Diskon ${discountPercent}%`, referrerName: voucher.referrerName,
    affiliateCheckoutId: affiliate?.id ?? null, checkoutExpiresAt: affiliate?.expiresAt ?? null,
    checkoutTiming: affiliate ? { createdAt: affiliate.createdAt,expiresAt: affiliate.expiresAt } : undefined };
}
