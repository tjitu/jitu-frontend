import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import {
  evaluatePracticeAnswer,
  getPracticeQuestions,
  getUserPracticeContext,
  verifySandboxPreviewToken,
} from "@/lib/practice-store";

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    const { searchParams } = new URL(req.url);
    const subtest = searchParams.get("subtest") || "ALL";
    const difficulty = searchParams.get("difficulty") || "ALL";
    const batch = searchParams.get("batch") || "ALL";
    const search = searchParams.get("search") || "";
    const target = searchParams.get("target") || undefined;
    const questionId = searchParams.get("questionId") || undefined;
    const randomParam = searchParams.get("random");
    const random = randomParam === "1" || randomParam === "true";
    const limitRaw = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined;
    const sandboxToken = req.headers.get("x-sandbox-token") || undefined;

    const feed = await getPracticeQuestions({
      subtest,
      difficulty,
      batch,
      search,
      userId: appUser?.id || null,
      target,
      questionId,
      sandboxToken,
      random,
      limit,
    });

    return NextResponse.json({ success: true, ...feed });
  } catch (err: any) {
    console.error("GET /api/practice error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil soal latihan." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    const body = await req.json();
    const { questionId, selectedOptionId, inputText, revealOnly, sandbox } = body || {};
    const sandboxRequested = Boolean(sandbox);
    const sandboxToken = req.headers.get("x-sandbox-token") || undefined;

    let sandboxTokenValid = false;
    if (sandboxRequested) {
      const tokenCheck = await verifySandboxPreviewToken(sandboxToken);
      sandboxTokenValid = tokenCheck.valid;

      if (!sandboxTokenValid) {
        if (!appUser) {
          return NextResponse.json(
            {
              success: false,
              error: "Sesi pratinjau Sandbox tidak valid atau kedaluwarsa. Login akun Sandbox atau buka ulang dari Control Center.",
              requiresAuth: true,
            },
            { status: 401 }
          );
        }
        const ctx = await getUserPracticeContext(appUser.id);
        if (!ctx.isSandbox) {
          return NextResponse.json(
            {
              success: false,
              error: "Akun ini belum memiliki akses Sandbox QC.",
            },
            { status: 403 }
          );
        }
      }
    } else if (!appUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Silakan masuk ke akun terlebih dahulu untuk menjawab soal dan mengakses pembahasan.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "questionId is required" },
        { status: 400 }
      );
    }

    const result = await evaluatePracticeAnswer(
      String(questionId),
      selectedOptionId ? String(selectedOptionId) : null,
      {
        userId: appUser?.id || null,
        inputText: inputText !== undefined && inputText !== null ? String(inputText) : null,
        revealOnly: Boolean(revealOnly),
        sandbox: sandboxRequested,
        sandboxTokenValid,
      }
    );

    if (result.limitReached) {
      return NextResponse.json(
        {
          success: false,
          ...result,
          error: "Kuota harian 10 soal untuk akun gratis sudah tercapai hari ini.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST /api/practice error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengevaluasi jawaban." },
      { status: 500 }
    );
  }
}
