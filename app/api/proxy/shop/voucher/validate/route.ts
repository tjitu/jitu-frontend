import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { getAuthenticatedAppUser } from '@/lib/server-auth';
import { CheckoutError, getShopPackage, priceVoucher } from '@/lib/shop-pricing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!await getAuthenticatedAppUser(req)) return NextResponse.json({ valid: false, message: 'Silakan masuk akun terlebih dahulu.' }, { status: 401 });
    const body = await req.json() as { code?: string; packageId?: string };
    if (typeof body.code !== 'string' || typeof body.packageId !== 'string') throw new CheckoutError('Kode voucher dan paket wajib diisi.');
    const pool = getDbPool();
    const pkg = await getShopPackage(pool,body.packageId);
    return NextResponse.json(await priceVoucher(pool,body.code,pkg.price));
  } catch (error) {
    return NextResponse.json({ valid: false, message: error instanceof CheckoutError ? error.message : 'Gagal memvalidasi kode voucher.' },
      { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
