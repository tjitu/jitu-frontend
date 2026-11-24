import type { NextRequest } from "next/server";
import { getDbPool } from "@/lib/db";

export async function canPreviewTryout(
  _request: NextRequest,
  userId: string,
  _tryoutId: string,
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

  return false;
}
