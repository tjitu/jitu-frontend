import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getHotQuestions } from "@/lib/practice-store";

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    const { searchParams } = new URL(req.url);
    const limitRaw = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 5;

    const questions = await getHotQuestions(appUser?.id || null, limit);
    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error("GET /api/hot-questions error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil Hot Questions." },
      { status: 500 }
    );
  }
}
