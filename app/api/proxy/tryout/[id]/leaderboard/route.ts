import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/server-auth";
import { getDbPool } from "@/lib/db";
import { parsePtnTargets, PtnChoice } from "@/lib/target";
import { isUserPremiumActive } from "@/lib/premium";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TryoutParams = { params: Promise<{ id: string }> };

interface FinishedAttemptRow {
  userId: string;
  userName: string | null;
  target: string | null;
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
      `SELECT id, "scheduledEnd", "solutionPrice" FROM "TryOut" WHERE id = $1 LIMIT 1`,
      [tryoutId],
    );
    const tryout = tryoutRes.rows[0];

    if (!tryout) {
      return NextResponse.json(
        { message: "Tryout tidak ditemukan." },
        { status: 404 },
      );
    }

    const solutionPrice = Number(tryout.solutionPrice ?? 0);
    if (solutionPrice > 0 && user.role !== "ADMIN") {
      const [unlockResult, premiumResult] = await Promise.all([
        pool.query(
          `SELECT 1 FROM "UnlockedSolution" WHERE "userId" = $1 AND "tryOutId" = $2 LIMIT 1`,
          [user.id, tryoutId],
        ),
        pool.query(
          `SELECT "isPremium", "premiumExpiresAt" FROM "user" WHERE id = $1 LIMIT 1`,
          [user.id],
        ),
      ]);
      const premiumPass = isUserPremiumActive(premiumResult.rows[0]);
      if (!premiumPass && unlockResult.rows.length === 0) {
        return NextResponse.json(
          { message: `Upgrade ${solutionPrice} coin untuk melihat ranking.`, solutionPrice },
          { status: 403 },
        );
      }
    }

    const scheduledEndDate = tryout.scheduledEnd ? new Date(tryout.scheduledEnd) : null;
    const isEnded = scheduledEndDate ? new Date() >= scheduledEndDate : true;

    let attempts: FinishedAttemptRow[] = [];
    try {
      const { rows } = await pool.query<FinishedAttemptRow>(
        `SELECT a."userId" AS "userId",
                u.name AS "userName",
                u.target AS "target",
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
                u.target AS "target",
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

    const userHasFinished = attempts.some((a) => a.userId === user.id);
    const isAdmin = user.role === "ADMIN";

    // If tryout has not ended and user hasn't finished, hide leaderboard to prevent spoilers
    if (!isEnded && !userHasFinished && !isAdmin) {
      return NextResponse.json(
        { message: "Selesaikan tryout terlebih dahulu untuk melihat leaderboard." },
        { status: 403 },
      );
    }

    const eligibleAttempts = isEnded && scheduledEndDate
      ? attempts.filter(
          (attempt) =>
            attempt.finishedAt && new Date(attempt.finishedAt) <= scheduledEndDate,
        )
      : attempts;

    const mappedLeaderboard = eligibleAttempts.map((attempt, index) => {
      const parsed = parsePtnTargets(attempt.target);
      return {
        rank: index + 1,
        userId: attempt.userId,
        name: attempt.userName || "Peserta",
        score: Math.round(Number(attempt.totalScore) || 0),
        isCurrentUser: attempt.userId === user.id,
        target: attempt.target,
        pilihan1: parsed.pilihan1
          ? {
              rank: 0,
              totalParticipants: 0,
              uniId: parsed.pilihan1.uniId,
              university: parsed.pilihan1.university,
              acronym: parsed.pilihan1.acronym,
              jurusan: parsed.pilihan1.jurusan,
              logo: parsed.pilihan1.logo,
            }
          : null,
      };
    });

    let currentUserRank: {
      rank: number;
      totalParticipants: number;
      userId: string;
      name: string;
      score: number;
      isCurrentUser: boolean;
      target?: string | null;
      pilihan1?: any;
      choice1?: any;
    } | null = null;

    const userAttemptIndex = eligibleAttempts.findIndex((a) => a.userId === user.id);
    if (userAttemptIndex !== -1) {
      const userAttempt = eligibleAttempts[userAttemptIndex];
      const userTarget = parsePtnTargets(userAttempt.target);

      let choice1 = null;
      if (userTarget.pilihan1) {
        const targetUniId = userTarget.pilihan1.uniId?.toLowerCase();
        const targetAcronym = userTarget.pilihan1.acronym?.toLowerCase();
        const targetUni = userTarget.pilihan1.university?.toLowerCase();

        const isSameCampus = (choice: PtnChoice | null) => {
          if (!choice) return false;
          if (targetUniId && choice.uniId && choice.uniId.toLowerCase() === targetUniId && targetUniId !== "custom") return true;
          if (targetAcronym && choice.acronym && choice.acronym.toLowerCase() === targetAcronym) return true;
          if (targetUni && choice.university && choice.university.toLowerCase() === targetUni) return true;
          return false;
        };

        const choice1Attempts = mappedLeaderboard.filter((m) => {
          if (!m.pilihan1) return false;
          return isSameCampus(m.pilihan1 as unknown as PtnChoice);
        });

        const choice1RankIndex = choice1Attempts.findIndex((m) => m.userId === user.id);
        const choice1Rank = choice1RankIndex !== -1 ? choice1RankIndex + 1 : 1;
        const choice1Total = choice1Attempts.length > 0 ? choice1Attempts.length : 1;

        choice1 = {
          rank: choice1Rank,
          totalParticipants: choice1Total,
          uniId: userTarget.pilihan1.uniId,
          university: userTarget.pilihan1.university,
          acronym: userTarget.pilihan1.acronym,
          jurusan: userTarget.pilihan1.jurusan,
          logo: userTarget.pilihan1.logo,
        };
      }

      currentUserRank = {
        rank: userAttemptIndex + 1,
        totalParticipants: eligibleAttempts.length,
        userId: user.id,
        name: userAttempt.userName || "Peserta",
        score: Math.round(Number(userAttempt.totalScore) || 0),
        isCurrentUser: true,
        target: userAttempt.target,
        pilihan1: choice1,
        choice1,
      };
    }

    return NextResponse.json({
      top10: mappedLeaderboard.slice(0, 10),
      all: mappedLeaderboard,
      currentUserRank,
      totalParticipants: eligibleAttempts.length,
      isOngoing: !isEnded,
    });
  } catch (error) {
    console.error("GET /api/proxy/tryout/[id]/leaderboard error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data leaderboard." },
      { status: 500 },
    );
  }
}
