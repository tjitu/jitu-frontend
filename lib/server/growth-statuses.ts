import 'server-only';
import type { Pool } from 'pg';
import type { VerificationStatus } from '@/lib/growth/types';
export async function growthStatuses(pool: Pick<Pool, 'query'>, userId: string | undefined, ids: string[]) {
  if (!userId || ids.length === 0) return new Map<string, VerificationStatus>();
  const rows = await pool.query<{ tryoutId: string; status: VerificationStatus }>(
    'SELECT "tryoutId",status FROM "TryoutRegistrationVerification" WHERE "userId"=$1 AND "tryoutId"=ANY($2::text[])', [userId, ids]);
  return new Map(rows.rows.map(row => [row.tryoutId, row.status]));
}
