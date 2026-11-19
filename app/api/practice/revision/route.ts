import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getUserPracticeContext, verifySandboxPreviewToken } from "@/lib/practice-store";
import { requestSandboxRevision } from "@/lib/sandbox-revision";

export async function POST(req: NextRequest) {
  try {
    const token = await verifySandboxPreviewToken(req.headers.get("x-sandbox-token"));
    const user = await getAuthenticatedAppUser(req).catch(() => null);
    if (!token.valid) {
      if (!user) return NextResponse.json({ success: false, error: "Buka ulang sesi Sandbox dari Control Center." }, { status: 401 });
      const context = await getUserPracticeContext(user.id);
      if (!context.isSandbox && user.role?.toUpperCase() !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Akun ini belum memiliki izin QC." }, { status: 403 });
      }
    }
    const body: unknown = await req.json();
    const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const id = typeof data.questionId === "string" ? data.questionId.trim() : "";
    const notes = typeof data.feedback === "string" ? data.feedback.trim() : "";
    if (!id || !notes || notes.length > 10000) {
      return NextResponse.json({ success: false, error: "Isi feedback revisi sepanjang 1–10.000 karakter." }, { status: 400 });
    }
    if (token.valid && token.questionId && token.questionId !== id) {
      return NextResponse.json({ success: false, error: "Sesi ini berlaku untuk soal lain." }, { status: 403 });
    }
    const updated = await requestSandboxRevision(id, notes, token.createdBy || user?.email || "QC Sandbox");
    if (!updated) return NextResponse.json({ success: false, error: "Status soal sudah berubah. Muat ulang Sandbox." }, { status: 409 });
    return NextResponse.json({ success: true, questionId: id, status: "NEEDS_REVISION" });
  } catch {
    return NextResponse.json({ success: false, error: "Feedback gagal disimpan. Coba kirim kembali." }, { status: 500 });
  }
}
