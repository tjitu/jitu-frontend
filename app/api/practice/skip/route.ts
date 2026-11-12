import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { skipPracticeQuestion } from "@/lib/practice-store";

export async function POST(req: NextRequest) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    if (!appUser) {
      return NextResponse.json(
        { error: "Unauthorized", requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const questionId = body?.questionId ? String(body.questionId).trim() : "";
    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required" },
        { status: 400 }
      );
    }

    const result = await skipPracticeQuestion(appUser.id, questionId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/practice/skip error:", err);
    return NextResponse.json(
      { error: "Gagal melewati soal." },
      { status: 500 }
    );
  }
}
