import { NextRequest, NextResponse } from "next/server";
import { getPracticeQuestions, evaluatePracticeAnswer } from "@/lib/practice-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subtest = searchParams.get("subtest") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const search = searchParams.get("search") || undefined;

    const questions = await getPracticeQuestions({ subtest, difficulty, search });
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    console.error("Failed to get practice questions:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, selectedOptionId } = body;

    if (!questionId || !selectedOptionId) {
      return NextResponse.json(
        { success: false, message: "questionId and selectedOptionId are required" },
        { status: 400 }
      );
    }

    const result = await evaluatePracticeAnswer(questionId, selectedOptionId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Failed to evaluate practice answer:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}
