import 'server-only';
import type { Pool } from 'pg';
import type { GrowthState } from '@/lib/growth/types';

type Database = Pick<Pool, 'query'>;
export class GrowthError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
export async function growthQuery<T>(db: Database, sql: string, values: unknown[] = []): Promise<T[]> {
  try { return (await db.query(sql, values)).rows as T[]; }
  catch (error) {
    const message = error instanceof Error ? error.message : '';
    const match = message.match(/GROWTH_([A-Z_]+): ([^\n]+)/);
    if (match) {
      const code = match[1];
      const status = code === 'NOT_FOUND' ? 404 : code === 'CONFLICT' ? 409 : ['FORBIDDEN','PENDING','REJECTED'].includes(code) ? 403 : 400;
      throw new GrowthError(status, `GROWTH_${code}`, match[2]);
    }
    if (typeof error === 'object' && error !== null && 'code' in error && String(error.code).startsWith('22')) {
      throw new GrowthError(400, 'GROWTH_REQUIREMENTS', 'Data pendaftaran tidak valid.');
    }
    throw error;
  }
}
export async function submitGrowthRegistration(db: Database, tryoutId: string, userId: string, input: unknown) {
  const state = (await growthQuery<{ state: GrowthState | null }>(db,
    'SELECT growth_submit($1,$2,$3::jsonb) AS state', [tryoutId, userId, JSON.stringify(input ?? {})]))[0]?.state;
  if (!state) return null;
  return { ...state, verificationStatus: state.verification?.status,
    message: state.verification?.status === 'PENDING_VERIFICATION' ? 'Pendaftaranmu akan diverifikasi terlebih dahulu.' : 'Pendaftaran Berhasil!' };
}
