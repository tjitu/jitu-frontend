import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAppUser } from '@/lib/server-auth';
import { getDbPool } from '@/lib/db';
import { canPreviewTryout } from '@/app/api/proxy/tryout/[id]/_lib/can-preview-tryout';
import { GrowthError } from './growth-registration';

export async function growthAccess(request: NextRequest, id: string) {
  const user = await getAuthenticatedAppUser(request);
  if (!user) throw new GrowthError(401, 'UNAUTHORIZED', 'Silakan masuk terlebih dahulu.');
  const pool = getDbPool();
  const rows = await pool.query<{ status: string; solutionPrice: number }>(`SELECT COALESCE(curation_status,'PUBLISHED') AS status,"solutionPrice" FROM "TryOut" WHERE id=$1`, [id]);
  if (!rows.rows[0] || (rows.rows[0].status !== 'PUBLISHED' && !(await canPreviewTryout(request, user.id, id)))) {
    throw new GrowthError(404, 'GROWTH_NOT_FOUND', 'Tryout tidak ditemukan.');
  }
  return { user, pool, preview: rows.rows[0].status !== 'PUBLISHED', solutionPrice: Number(rows.rows[0].solutionPrice) };
}
export function growthErrorResponse(error: unknown) {
  return NextResponse.json({ code: error instanceof GrowthError ? error.code : 'GROWTH_UNAVAILABLE',
    message: error instanceof GrowthError ? error.message : 'Pendaftaran belum dapat dimuat. Coba lagi.' },
  { status: error instanceof GrowthError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
}
