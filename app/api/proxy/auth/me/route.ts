import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken, resolveFirebaseUser } from "@/lib/firebase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Firebase ID token is required." },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json(
        { message: "Firebase ID token is required." },
        { status: 401 }
      );
    }

    const payload = await verifyFirebaseIdToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: "Firebase ID token is invalid or expired." },
        { status: 401 }
      );
    }

    const user = await resolveFirebaseUser(payload);
    if (!user) {
      return NextResponse.json(
        { message: "Akun belum siap digunakan. Coba beberapa saat lagi." },
        { status: 400 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan autentikasi.";
    console.error("GET /api/proxy/auth/me error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
