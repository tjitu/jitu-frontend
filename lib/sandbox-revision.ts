import { getDbPool } from "./db";

export async function requestSandboxRevision(id: string, notes: string, reviewer: string) {
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE public."Question" SET status = 'NEEDS_REVISION', revision_notes = $2,
        reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'QC_SANDBOX' RETURNING id`,
      [id, notes, reviewer]
    );
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query('DELETE FROM public."PracticeAssignment" WHERE question_id = $1', [id]);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
