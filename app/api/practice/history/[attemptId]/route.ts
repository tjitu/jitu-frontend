import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getPracticeHistory } from "@/lib/practice-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
      return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    }

    const history = await getPracticeHistory(appUser.id, { attemptId });
    if (history.locked) {
      return NextResponse.json({ error: "Aktifkan Premium Pass untuk membuka riwayat latihan dan pembahasan." }, { status: 403 });
    }
    const item = history.items[0];
    if (!item) {
      return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    console.error("GET /api/practice/history/[attemptId] error:", err);
    return NextResponse.json({ error: "Gagal mengambil pembahasan soal." }, { status: 500 });
  }
}
