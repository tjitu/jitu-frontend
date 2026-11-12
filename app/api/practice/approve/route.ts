import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import {
  approveSandboxQuestion,
  getUserPracticeContext,
  verifySandboxPreviewToken,
} from "@/lib/practice-store";

export async function POST(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    const sandboxToken = req.headers.get("x-sandbox-token") || undefined;
    const tokenCheck = await verifySandboxPreviewToken(sandboxToken);

    if (!tokenCheck.valid) {
      if (!appUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Sesi pratinjau Sandbox tidak valid atau kedaluwarsa. Login akun Sandbox atau buka ulang dari Control Center.",
            requiresAuth: true,
          },
          { status: 401 }
        );
      }

      const ctx = await getUserPracticeContext(appUser.id);
      const isAdmin = String(appUser.role || "").toUpperCase() === "ADMIN";
      if (!ctx.isSandbox && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "Akun ini belum memiliki izin untuk melakukan ACC soal Sandbox QC.",
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const questionId = body?.questionId ? String(body.questionId).trim() : "";
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "questionId is required" },
        { status: 400 }
      );
    }

    const reviewerLabel =
      tokenCheck.createdBy || appUser?.email || appUser?.id || "QC Sandbox";
    const result = await approveSandboxQuestion(questionId, reviewerLabel);

    if (!result.approved) {
      return NextResponse.json(
        { success: false, ...result },
        { status: result.statusCode || 400 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST /api/practice/approve error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal meng-ACC soal ke status Ready." },
      { status: 500 }
    );
  }
}
