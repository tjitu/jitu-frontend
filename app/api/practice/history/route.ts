import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getPracticeHistory } from "@/lib/practice-store";

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    if (!appUser) {
      return NextResponse.json(
        { error: "Unauthorized", requiresAuth: true },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const subtest = searchParams.get("subtest") || "ALL";
    const search = searchParams.get("search") || "";

    const history = await getPracticeHistory(appUser.id, { subtest, search });
    return NextResponse.json(history);
  } catch (err: any) {
    console.error("GET /api/practice/history error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat latihan." },
      { status: 500 }
    );
  }
}
