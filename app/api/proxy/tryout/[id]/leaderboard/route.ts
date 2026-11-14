import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TryoutParams = { params: Promise<{ id: string }> };

interface FinishedAttemptRow {
  userId: string;
  userName: string | null;
  totalScore: number | string | null;
  finishedAt: Date | string | null;
}

export async function GET(request: NextRequest, { params }: TryoutParams) {
  try {
    const user = await getAuthenticatedAppUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Silakan masuk terlebih dahulu." },
        { status: 401 },
      );
    }

    const { id: tryoutId } = await params;
    const pool = getDbPool();

    const tryoutRes = await pool.query(
      `SELECT id, "scheduledEnd" FROM "TryOut" WHERE id = $1 LIMIT 1`,
      [tryoutId],
    );
    const tryout = tryoutRes.rows[0];

    if (!tryout) {
      return NextResponse.json(
        { message: "Tryout tidak ditemukan." },
        { status: 404 },
      );
    }

    if (!tryout.scheduledEnd) {
      return NextResponse.json(
        { message: "Leaderboard tidak tersedia untuk tryout ini." },
        { status: 403 },
      );
    }

    const scheduledEndDate = new Date(tryout.scheduledEnd);
    if (new Date() < scheduledEndDate) {
      return NextResponse.json(
        { message: "Leaderboard akan tersedia setelah masa tryout berakhir." },
        { status: 403 },
      );
    }

    let attempts: FinishedAttemptRow[] = [];
    try {
      const { rows } = await pool.query<FinishedAttemptRow>(
        `SELECT a."userId" AS "userId",
                u.name AS "userName",
                a.total_score AS "totalScore",
                a.finished_at AS "finishedAt"
         FROM "TryOutAttempt" a
         JOIN "user" u ON u.id = a."userId"
         WHERE a.try_out_id = $1
           AND a.status = 'FINISHED'
           AND (COALESCE(u."isSandbox", false) = false OR a."userId" = $2)
         ORDER BY a.total_score DESC`,
        [tryoutId, user.id],
      );
      attempts = rows;
    } catch (error) {
      if ((error as { code?: string })?.code !== "42703") throw error;
      const { rows } = await pool.query<FinishedAttemptRow>(
        `SELECT a."userId" AS "userId",
                u.name AS "userName",
                a.total_score AS "totalScore",
                a.finished_at AS "finishedAt"
         FROM "TryOutAttempt" a
         JOIN "user" u ON u.id = a."userId"
         WHERE a.try_out_id = $1
           AND a.status = 'FINISHED'
         ORDER BY a.total_score DESC`,
        [tryoutId],
      );
      attempts = rows;
    }

    const eligibleAttempts = attempts.filter(
      (attempt) =>
        attempt.finishedAt && new Date(attempt.finishedAt) <= scheduledEndDate,
    );

    const officialLeaderboard = eligibleAttempts.map((attempt, index) => ({
      rank: index + 1,
      name: attempt.userName || "Peserta",
      score: Math.round(Number(attempt.totalScore) || 0),
      isCurrentUser: attempt.userId === user.id,
    }));

    let currentUserRank: {
      rank: number;
      name: string;
      score: number;
      isCurrentUser: boolean;
    } | null = null;

    const userAttemptIndex = attempts.findIndex((a) => a.userId === user.id);
    if (userAttemptIndex !== -1) {
      const userAttempt = attempts[userAttemptIndex];
      currentUserRank = {
        rank: userAttemptIndex + 1,
        name: userAttempt.userName || "Peserta",
        score: Math.round(Number(userAttempt.totalScore) || 0),
        isCurrentUser: true,
      };
    }

    return NextResponse.json({
      top10: officialLeaderboard.slice(0, 10),
      currentUserRank,
    });
  } catch (error) {
    console.error("GET /api/proxy/tryout/[id]/leaderboard error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data leaderboard." },
      { status: 500 },
    );
  }
}
