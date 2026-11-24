import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAppUser(request);
  if (!user) return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.attemptId !== "string" || !body.attemptId) {
    return NextResponse.json({ message: "Pilih pengerjaan yang ingin diulang." }, { status: 400 });
  }

  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const sandbox = await client.query(
      'SELECT id FROM "user" WHERE id = $1 AND "isSandbox" IS TRUE FOR UPDATE', [user.id],
    );
    if (!sandbox.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Mulai ulang hanya tersedia untuk akun sandbox." }, { status: 403 });
    }

    const { rows } = await client.query<{ id: string; status: string }>(
      `SELECT id, status FROM "TryOutAttempt" WHERE "userId" = $1 AND try_out_id = $2
       ORDER BY started_at DESC, id DESC FOR UPDATE`, [user.id, id],
    );
    const latest = rows[0];
    if (latest?.id !== body.attemptId || !["FINISHED", "IN_PROGRESS"].includes(latest.status)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Pengerjaan sudah berubah. Muat ulang halaman tryout." }, { status: 409 });
    }

    const ids = rows.map(row => row.id);
    await client.query('DELETE FROM "UserAnswer" WHERE tryout_attempt_id = ANY($1::text[])', [ids]);
    // Subtest scores cascade with the attempt. A new ID isolates the next run from old exam tabs.
    await client.query('DELETE FROM "TryOutAttempt" WHERE id = ANY($1::text[])', [ids]);
    await client.query(
      `INSERT INTO "TryOutAttempt" (id, "userId", try_out_id, status, total_score, current_subtest_order, started_at)
       VALUES ($1, $2, $3, 'NOT_STARTED', 0, 0, NOW())`, [randomUUID(), user.id, id],
    );
    await client.query("COMMIT");
    return NextResponse.json({ message: "Tryout siap dikerjakan dari awal." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Sandbox tryout restart failed", error);
    return NextResponse.json({ message: "Gagal memulai ulang tryout. Coba lagi." }, { status: 500 });
  } finally {
    client.release();
  }
}
