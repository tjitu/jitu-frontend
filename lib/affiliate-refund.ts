import { getDbPool } from './db';

export async function reconcileAffiliateRefund(orderId: string, verified: {
  transaction_status?: string; gross_amount?: string; refund_amount?: string;
}) {
  if (!['refund','partial_refund'].includes(verified.transaction_status ?? '')) return false;
  const pool = getDbPool();
  const { rows: [payment] } = await pool.query<{ amount: number }>('SELECT amount FROM "Payment" WHERE "orderId"=$1',[orderId]);
  if (!payment || Number(verified.gross_amount) !== payment.amount) throw new Error('Verified refund amount does not match payment.');
  const total = verified.transaction_status === 'refund' ? payment.amount : Number(verified.refund_amount);
  if (!Number.isSafeInteger(total) || total < 0 || total > payment.amount) throw new Error('Invalid verified cumulative refund total.');
  await pool.query('SELECT affiliate_refund($1,$2)',[orderId,total]);
  return true;
}
