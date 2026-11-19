import type { Pool } from "pg";

export function learningStreak(days: string[], now = new Date()): number {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const cursor = new Date(today + "T00:00:00Z");
  const active = new Set(days);
  if (!active.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (active.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

interface StatsRow {
  lastScore: number | null;
  personalBest: number | null;
  totalFinished: number;
  weeklyActivity: number;
  solvedQuestions: number;
  days: string[];
}

export async function getLearningStats(pool: Pool, userId: string) {
  const table = await pool.query<{ exists: boolean }>(
    `SELECT to_regclass('public."PracticeAttempt"') IS NOT NULL AS "exists"`,
  );
  const practice = table.rows[0].exists
    ? `UNION ALL
       SELECT
         CASE WHEN pg_typeof(pa.answered_at) = 'timestamp with time zone'::regtype
           THEN COALESCE(pa.answered_at, pa.updated_at) AT TIME ZONE 'Asia/Jakarta'
           ELSE (COALESCE(pa.answered_at, pa.updated_at) AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'
         END AS activity_at
       FROM public."PracticeAttempt" pa
       WHERE pa.user_id = $1 AND pa.status = 'ANSWERED'
         AND COALESCE(pa.is_reveal_only, false) = false
         AND pa.is_correct IS NOT NULL
         AND (pa.selected_option_id IS NOT NULL OR NULLIF(BTRIM(pa.input_text), '') IS NOT NULL)`
    : "";
  const { rows } = await pool.query<StatsRow>(
    `WITH activity AS (
       SELECT (ua."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta' AS activity_at
       FROM public."UserAnswer" ua
       JOIN public."TryOutAttempt" att ON att.id = ua.tryout_attempt_id
       WHERE att."userId" = $1
         AND (ua.question_item_id IS NOT NULL OR NULLIF(BTRIM(ua."inputText"), '') IS NOT NULL)
       UNION ALL
       SELECT (d."completedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'
       FROM public."DailyQuestionLog" d
       WHERE d."userId" = $1 AND NULLIF(BTRIM(d."userAnswer"), '') IS NOT NULL
       ${practice}
     ), finished AS (
       SELECT total_score, finished_at FROM public."TryOutAttempt"
       WHERE "userId" = $1 AND status = 'FINISHED'
     )
     SELECT
       (SELECT total_score FROM finished ORDER BY finished_at DESC NULLS LAST LIMIT 1) AS "lastScore",
       (SELECT MAX(total_score) FROM finished) AS "personalBest",
       (SELECT COUNT(*)::int FROM finished) AS "totalFinished",
       (SELECT COUNT(*)::int FROM public."TryOutAttempt"
        WHERE "userId" = $1 AND started_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '7 days') AS "weeklyActivity",
       COUNT(*)::int AS "solvedQuestions",
       COALESCE(ARRAY_AGG(DISTINCT TO_CHAR(activity_at::date, 'YYYY-MM-DD'))
         FILTER (WHERE activity_at IS NOT NULL), ARRAY[]::text[]) AS days
     FROM activity`,
    [userId],
  );
  const stats = rows[0];
  return {
    lastScore: Math.round(Number(stats.lastScore) || 0),
    personalBest: Math.round(Number(stats.personalBest) || 0),
    totalFinished: stats.totalFinished,
    weeklyActivity: stats.weeklyActivity,
    solvedQuestions: stats.solvedQuestions,
    currentStreak: learningStreak(stats.days),
  };
}
