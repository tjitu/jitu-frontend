import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getDbPool } from "@/lib/db";

export async function canPreviewTryout(
  request: NextRequest,
  userId: string,
  tryoutId: string,
): Promise<boolean> {
  const pool = getDbPool();

  try {
    const { rows } = await pool.query(
      `SELECT role, COALESCE("isSandbox", false) AS "isSandbox"
       FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (rows[0]?.role === "ADMIN" || rows[0]?.isSandbox === true) return true;
  } catch (error) {
    // Older databases may not yet have the optional isSandbox column.
    if ((error as { code?: string })?.code !== "42703") throw error;
    const { rows } = await pool.query(
      `SELECT role FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (rows[0]?.role === "ADMIN") return true;
  }

  const token = request.headers.get("x-sandbox-token")?.trim() || "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return false;

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { rows } = await pool.query(
      `SELECT 1 FROM "QcSandboxPreviewSession"
       WHERE token_hash = $1 AND tryout_id = $2 AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash, tryoutId],
    );
    return rows.length > 0;
  } catch {
    // A preview token is never accepted when its session cannot be verified.
    return false;
  }
}
