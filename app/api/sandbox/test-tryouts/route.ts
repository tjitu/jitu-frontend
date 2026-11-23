import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
const IDS = ["sandbox-test-free", "sandbox-test-one-coin"];

async function sandboxUser(request: NextRequest) {
  const user = await getAuthenticatedAppUser(request);
  if (!user) return null;
  const { rows } = await getDbPool().query(
    `SELECT id FROM "user" WHERE id = $1 AND COALESCE("isSandbox", false) = true`,
    [user.id],
  );
  return rows[0] ? user : null;
}

export async function GET(request: NextRequest) {
  const user = await sandboxUser(request);
  if (!user) return NextResponse.json({ tryouts: [] }, { status: 403 });
  const { rows } = await getDbPool().query(
    `SELECT id, title, "solutionPrice" FROM "TryOut"
     WHERE id = ANY($1::text[]) AND "isPublic" = false AND curation_status = 'QC_SANDBOX'
     ORDER BY "solutionPrice"`, [IDS],
  );
  return NextResponse.json({ tryouts: rows });
}

export async function POST(request: NextRequest) {
  const user = await sandboxUser(request);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  const body: { id?: unknown } = await request.json().catch(() => ({}));
  if (typeof body.id !== "string" || !IDS.includes(body.id)) {
    return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
  }
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const eligible = await client.query(
      `SELECT id FROM "TryOut" WHERE id = $1 AND "isPublic" = false AND curation_status = 'QC_SANDBOX' FOR UPDATE`, [body.id],
    );
    if (!eligible.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Tryout tidak ditemukan." }, { status: 404 });
    }
    const attempts = `SELECT id FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2`;
    await client.query(`DELETE FROM "UserAnswer" WHERE tryout_attempt_id IN (${attempts})`, [user.id, body.id]);
    await client.query(`DELETE FROM "TryOutSubtestScore" WHERE tryout_attempt_id IN (${attempts})`, [user.id, body.id]);
    await client.query(`DELETE FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2`, [user.id, body.id]);
    await client.query(`DELETE FROM "UnlockedSolution" WHERE "userId" = $1 AND "tryOutId" = $2`, [user.id, body.id]);
    await client.query(`UPDATE "TryOut" SET "scheduledEnd" = NOW() + INTERVAL '5 years' WHERE id = $1`, [body.id]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Tryout berhasil direset." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Sandbox reset failed:", error);
    return NextResponse.json({ message: "Tryout gagal direset." }, { status: 500 });
  } finally {
    client.release();
  }
}
