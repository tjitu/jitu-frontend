import { createHash, randomUUID } from "crypto";
import { getDbPool } from "./db";

export type SolutionStep = {
  stepNumber: number;
  category?: string;
  title: string;
  content: string;
};

export type QuestionSolutionData = {
  id: string;
  steps: SolutionStep[];
  staticContent: string | null;
  quickTrick: string | null;
  keyFormula: string | null;
  defaultView: string;
};

export type PracticeQuestionOption = {
  id: string;
  content: string;
  order: number;
};

export type PracticeQuestionSummary = {
  id: string;
  subtest: string;
  difficulty: string;
  type: string;
  points: number;
  topicTitle: string | null;
  subtopicTitle: string | null;
  pattern: string | null;
  batch: string | null;
  narration: string | null;
  content: string;
  imageUrl: string | null;
  options: PracticeQuestionOption[];
  hasSolution: boolean;
  stepsCount: number;
  isPreviouslySkipped?: boolean;
};

export type UserPracticeContext = {
  isPremium: boolean;
  isSandbox: boolean;
  dailyAnsweredCount: number;
  dailyLimit: number;
  totalAnswered: number;
};

export type PracticeFeedResult = UserPracticeContext & {
  questions: PracticeQuestionSummary[];
  availableBatches?: string[];
  sandboxAuthorized?: boolean;
};

export type PracticeEvaluationResult = {
  limitReached: boolean;
  isCorrect: boolean;
  correctOptionId: string | null;
  correctAnswerText: string | null;
  solution: QuestionSolutionData | null;
  dailyAnsweredCount: number;
  dailyLimit: number;
  isPremium: boolean;
  totalAnswered: number;
};

export type PracticeHistoryItem = {
  attemptId: string;
  questionId: string;
  subtest: string;
  difficulty: string;
  type: string;
  points: number;
  topicTitle: string | null;
  subtopicTitle: string | null;
  narration: string | null;
  content: string;
  imageUrl: string | null;
  options: Array<{
    id: string;
    content: string;
    order: number;
    isCorrect: boolean;
  }>;
  selectedOptionId: string | null;
  inputText: string | null;
  correctOptionId: string | null;
  correctAnswerText: string | null;
  isCorrect: boolean;
  isRevealOnly: boolean;
  answeredAt: string;
  solution: QuestionSolutionData | null;
};

export const DAILY_FREE_PRACTICE_LIMIT = 10;

const SUBTEST_ALIASES: Record<string, string[]> = {
  PENALARAN_UMUM: ["PU", "PENALARAN_UMUM"],
  PENGETAHUAN_KUANTITATIF: ["PK", "PENGETAHUAN_KUANTITATIF"],
  PENALARAN_MATEMATIKA: ["PM", "PENALARAN_MATEMATIKA"],
  PEMAHAMAN_BACAAN_MENULIS: ["PBM", "PEMAHAMAN_BACAAN", "PEMAHAMAN_BACAAN_MENULIS"],
  PENGETAHUAN_PEMAHAMAN_UMUM: ["PPU", "PENGETAHUAN_UMUM", "PENGETAHUAN_PEMAHAMAN_UMUM"],
  LITERASI_INDONESIA: ["LBI", "LITERASI_INDONESIA", "LITERASI_BAHASA_INDONESIA"],
  LITERASI_INGGRIS: ["LBE", "LITERASI_INGGRIS", "LITERASI_BAHASA_INGGRIS"],
};

function expandSubtestAliases(raw?: string): string[] {
  const clean = (raw || "").toUpperCase().trim();
  if (!clean || clean === "ALL") return [];
  for (const aliases of Object.values(SUBTEST_ALIASES)) {
    if (aliases.includes(clean)) return aliases;
  }
  return [clean];
}

function normalizeAnswerText(val?: string | null): string {
  return String(val ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".")
    .toLowerCase();
}

function mapSolutionRow(row: any): QuestionSolutionData | null {
  if (!row || !row.solutionId) return null;
  let parsedSteps: SolutionStep[] = [];
  if (Array.isArray(row.solutionSteps)) {
    parsedSteps = row.solutionSteps;
  } else if (typeof row.solutionSteps === "string") {
    try {
      const p = JSON.parse(row.solutionSteps);
      if (Array.isArray(p)) parsedSteps = p;
    } catch {
      parsedSteps = [];
    }
  }
  return {
    id: String(row.solutionId),
    steps: parsedSteps,
    staticContent: row.solutionStaticContent || null,
    quickTrick: row.solutionQuickTrick || null,
    keyFormula: row.solutionKeyFormula || null,
    defaultView: row.solutionDefaultView || "INTERACTIVE",
  };
}

export async function getUserPracticeContext(userId?: string | null): Promise<UserPracticeContext> {
  if (!userId) {
    return {
      isPremium: false,
      isSandbox: false,
      dailyAnsweredCount: 0,
      dailyLimit: DAILY_FREE_PRACTICE_LIMIT,
      totalAnswered: 0,
    };
  }

  const pool = getDbPool();
  const [userRes, countRes] = await Promise.all([
    pool.query(
      `SELECT "isPremium", "premiumExpiresAt", "isSandbox" FROM public."user" WHERE "id" = $1 LIMIT 1`,
      [userId]
    ),
    pool.query(
      `SELECT
        COUNT(*) FILTER (
          WHERE "status" = 'ANSWERED'
            AND ("answered_at" AT TIME ZONE 'Asia/Jakarta')::date = (NOW() AT TIME ZONE 'Asia/Jakarta')::date
        )::int AS "dailyCount",
        COUNT(*) FILTER (WHERE "status" = 'ANSWERED')::int AS "totalAnswered"
      FROM public."PracticeAttempt"
      WHERE "user_id" = $1`,
      [userId]
    ),
  ]);

  const user = userRes.rows[0] || {};
  const expiresAt = user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
  const isPremium =
    Boolean(user.isPremium) && (!expiresAt || expiresAt.getTime() > Date.now());
  const isSandbox = Boolean(user.isSandbox);
  const counts = countRes.rows[0] || {};

  return {
    isPremium,
    isSandbox,
    dailyAnsweredCount: Number(counts.dailyCount) || 0,
    dailyLimit: DAILY_FREE_PRACTICE_LIMIT,
    totalAnswered: Number(counts.totalAnswered) || 0,
  };
}

/** Verifies a short-lived SHA-256 preview token issued by team-backend Control Center. */
export async function verifySandboxPreviewToken(
  token?: string | null
): Promise<{ valid: boolean; questionId: string | null; createdBy: string | null }> {
  const clean = String(token || "").trim();
  if (!/^[a-f0-9]{64}$/i.test(clean)) {
    return { valid: false, questionId: null, createdBy: null };
  }

  const pool = getDbPool();
  const tokenHash = createHash("sha256").update(clean).digest("hex");

  try {
    const res = await pool.query(
      `SELECT "question_id" AS "questionId", "created_by" AS "createdBy"
       FROM public."QcSandboxPreviewSession"
       WHERE "token_hash" = $1 AND "expires_at" > CURRENT_TIMESTAMP
       LIMIT 1`,
      [tokenHash]
    );
    if (res.rows.length === 0) {
      return { valid: false, questionId: null, createdBy: null };
    }
    return {
      valid: true,
      questionId: res.rows[0].questionId ? String(res.rows[0].questionId) : null,
      createdBy: res.rows[0].createdBy ? String(res.rows[0].createdBy) : null,
    };
  } catch (err: any) {
    if (err?.code === "42P01") {
      return { valid: false, questionId: null, createdBy: null };
    }
    throw err;
  }
}

export async function getPracticeQuestions(params: {
  subtest?: string;
  difficulty?: string;
  batch?: string;
  search?: string;
  userId?: string | null;
  target?: string;
  questionId?: string | null;
  sandboxToken?: string | null;
  random?: boolean;
  limit?: number;
}): Promise<PracticeFeedResult> {
  const pool = getDbPool();
  const ctx = await getUserPracticeContext(params.userId);
  const isSandboxTarget = String(params.target || "").toUpperCase().trim() === "SANDBOX";

  const tokenCheck = isSandboxTarget
    ? await verifySandboxPreviewToken(params.sandboxToken)
    : { valid: false, questionId: null };
  const sandboxAuthorized = isSandboxTarget ? ctx.isSandbox || tokenCheck.valid : true;

  if (isSandboxTarget && !sandboxAuthorized) {
    return {
      questions: [],
      sandboxAuthorized: false,
      ...ctx,
    };
  }

  const values: any[] = [];
  const clauses: string[] = [];

  const focusQuestionId =
    String(params.questionId || (isSandboxTarget ? tokenCheck.questionId : "") || "").trim() ||
    null;
  let focusParamRef: string | null = null;

  if (isSandboxTarget) {
    clauses.push(`COALESCE(q."status", 'DRAFT') = 'QC_SANDBOX'`);
  } else {
    clauses.push(`COALESCE(tout."status"::text, sub_tout."status"::text, '') NOT IN ('NOT_STARTED', 'IN_PROGRESS')`);
    clauses.push(`COALESCE(q."status", 'DRAFT') = 'READY'`);
    if (focusQuestionId) {
      values.push(focusQuestionId);
      focusParamRef = `$${values.length}`;
      clauses.push(
        `(q."id" = ${focusParamRef} OR (COALESCE(q."target", 'FOR_PRACTICE') <> 'SOAL_ASLI' AND pa."id" IS NOT NULL))`
      );
    } else {
      clauses.push(`COALESCE(q."target", 'FOR_PRACTICE') <> 'SOAL_ASLI'`);
      clauses.push(`pa."id" IS NOT NULL`);
    }
  }

  // Exclude already ANSWERED questions in regular practice (never in Sandbox preview)
  let attemptJoin = "";
  if (!isSandboxTarget && params.userId) {
    values.push(params.userId);
    const uidParam = `$${values.length}`;
    attemptJoin = `LEFT JOIN public."PracticeAttempt" pat ON pat."question_id" = q."id" AND pat."user_id" = ${uidParam}`;
    clauses.push(`COALESCE(pat."status", '') <> 'ANSWERED'`);
  }

  const subtestAliases = expandSubtestAliases(params.subtest);
  if (subtestAliases.length > 0) {
    values.push(subtestAliases);
    clauses.push(`UPPER(q."subtest") = ANY($${values.length}::text[])`);
  }

  if (params.difficulty && params.difficulty !== "ALL") {
    values.push(params.difficulty.toUpperCase().trim());
    clauses.push(`UPPER(q."difficulty") = $${values.length}`);
  }

  if (params.batch && params.batch !== "ALL") {
    const cleanBatch = params.batch.trim();
    if (cleanBatch === "__NONE__") {
      clauses.push(`(q."batch" IS NULL OR TRIM(q."batch") = '')`);
    } else if (cleanBatch) {
      values.push(cleanBatch);
      clauses.push(`TRIM(COALESCE(q."batch", '')) = $${values.length}`);
    }
  }

  if (params.search && params.search.trim()) {
    values.push(`%${params.search.trim()}%`);
    const p = `$${values.length}`;
    clauses.push(
      `(q."content" ILIKE ${p} OR COALESCE(q."narration", '') ILIKE ${p} OR COALESCE(t."title", t_direct."title", '') ILIKE ${p} OR COALESCE(s."title", '') ILIKE ${p})`
    );
  }

  let orderBy = "";
  if (isSandboxTarget) {
    if (focusQuestionId) {
      values.push(focusQuestionId);
      orderBy = `CASE WHEN q."id" = $${values.length} THEN 0 ELSE 1 END ASC, COALESCE(q."updatedAt", q."createdAt") DESC`;
    } else {
      orderBy = `COALESCE(q."updatedAt", q."createdAt") DESC`;
    }
  } else if (focusQuestionId && focusParamRef) {
    orderBy = `CASE WHEN q."id" = ${focusParamRef} THEN 0 ELSE 1 END ASC, ${
      params.userId
        ? `CASE WHEN pat."status" = 'SKIPPED' THEN 1 ELSE 0 END ASC, pat."updated_at" ASC NULLS FIRST, COALESCE(pa."sort_order", 0) ASC, pa."assigned_at" DESC NULLS LAST, q."createdAt" DESC`
        : `COALESCE(pa."sort_order", 0) ASC, pa."assigned_at" DESC NULLS LAST, q."createdAt" DESC`
    }`;
  } else if (params.random) {
    orderBy = `RANDOM()`;
  } else {
    orderBy = params.userId
      ? `CASE WHEN pat."status" = 'SKIPPED' THEN 1 ELSE 0 END ASC, pat."updated_at" ASC NULLS FIRST, COALESCE(pa."sort_order", 0) ASC, pa."assigned_at" DESC NULLS LAST, q."createdAt" DESC`
      : `COALESCE(pa."sort_order", 0) ASC, pa."assigned_at" DESC NULLS LAST, q."createdAt" DESC`;
  }

  const safeLimit =
    typeof params.limit === "number" && Number.isFinite(params.limit) && params.limit > 0
      ? Math.min(200, Math.floor(params.limit))
      : 200;

  const query = `
    SELECT
      q."id",
      q."subtest",
      q."difficulty",
      q."type",
      q."points",
      q."pattern",
      q."batch",
      q."narration",
      q."content",
      q."imageUrl",
      COALESCE(t."title", t_direct."title") AS "topicTitle",
      s."title" AS "subtopicTitle",
      ${attemptJoin ? `(pat."status" = 'SKIPPED')` : `false`} AS "isPreviouslySkipped",
      (sol."id" IS NOT NULL) AS "hasSolution",
      CASE
        WHEN jsonb_typeof(sol."steps") = 'array' THEN jsonb_array_length(sol."steps")
        ELSE 0
      END AS "stepsCount",
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', opt."id",
              'content', opt."content",
              'order', opt."order"
            ) ORDER BY opt."order" ASC
          )
          FROM public."QuestionItem" opt
          WHERE opt."question_id" = q."id"
        ),
        '[]'::json
      ) AS "options"
    FROM public."Question" q
    LEFT JOIN public."PracticeAssignment" pa ON pa."question_id" = q."id"
    LEFT JOIN public."Subtopic" s ON s."id" = q."subtopic_id"
    LEFT JOIN public."Topic" t ON t."id" = s."topicId"
    LEFT JOIN public."Topic" t_direct ON t_direct."id" = q."topic_id"
    LEFT JOIN public."Subtest" sub ON sub."id" = q."subtest_id"
    LEFT JOIN public."TryOut" tout ON tout."id" = q."tryoutId"
    LEFT JOIN public."TryOut" sub_tout ON sub_tout."id" = sub."try_out_id"
    LEFT JOIN public."QuestionSolution" sol ON sol."questionId" = q."id"
    ${attemptJoin}
    WHERE ${clauses.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT ${safeLimit}
  `;

  const { rows } = await pool.query(query, values);

  let availableBatches: string[] | undefined;
  if (isSandboxTarget) {
    try {
      const batchRes = await pool.query(
        `SELECT DISTINCT TRIM(q."batch") AS "batch"
         FROM public."Question" q
         WHERE COALESCE(q."status", 'DRAFT') = 'QC_SANDBOX'
           AND q."batch" IS NOT NULL
           AND TRIM(q."batch") <> ''
         ORDER BY 1 ASC`
      );
      availableBatches = batchRes.rows
        .map((row) => String(row.batch || "").trim())
        .filter(Boolean);
    } catch {
      availableBatches = [];
    }
  }

  const questions: PracticeQuestionSummary[] = rows.map((r) => ({
    id: String(r.id),
    subtest: String(r.subtest),
    difficulty: String(r.difficulty || "MEDIUM"),
    type: String(r.type || "MULTIPLE_CHOICE"),
    points: Number(r.points) || 1,
    topicTitle: r.topicTitle || null,
    subtopicTitle: r.subtopicTitle || null,
    pattern: r.pattern || null,
    batch: r.batch ? String(r.batch).trim() || null : null,
    narration: r.narration || null,
    content: String(r.content || ""),
    imageUrl: r.imageUrl || null,
    options: Array.isArray(r.options) ? r.options : [],
    hasSolution: Boolean(r.hasSolution),
    stepsCount: Number(r.stepsCount) || 0,
    isPreviouslySkipped: Boolean(r.isPreviouslySkipped),
  }));

  return {
    questions,
    ...(isSandboxTarget ? { sandboxAuthorized: true, availableBatches } : {}),
    ...ctx,
  };
}

export async function getHotQuestions(
  userId?: string | null,
  limit = 5
): Promise<PracticeQuestionSummary[]> {
  const pool = getDbPool();
  const safeLimit = Math.max(1, Math.min(10, Math.floor(Number(limit) || 5)));
  const values: any[] = [];
  const exclusionClauses: string[] = [];

  if (userId) {
    values.push(userId);
    const uidParam = `$${values.length}`;
    exclusionClauses.push(
      `NOT EXISTS (SELECT 1 FROM public."PracticeAttempt" pat WHERE pat."question_id" = q."id" AND pat."user_id" = ${uidParam} AND pat."status" = 'ANSWERED')`
    );
    exclusionClauses.push(
      `NOT EXISTS (SELECT 1 FROM public."UserAnswer" ua INNER JOIN public."TryOutAttempt" att ON att."id" = ua."tryout_attempt_id" WHERE ua."question_id" = q."id" AND att."userId" = ${uidParam})`
    );
    exclusionClauses.push(
      `NOT EXISTS (SELECT 1 FROM public."DailyQuestionLog" dql WHERE dql."questionId" = q."id" AND dql."userId" = ${uidParam})`
    );
  }

  values.push(safeLimit);
  const limitParam = `$${values.length}`;

  const query = `
    SELECT
      q."id",
      q."subtest",
      q."difficulty",
      q."type",
      q."points",
      q."pattern",
      q."batch",
      q."narration",
      q."content",
      q."imageUrl",
      COALESCE(t."title", t_direct."title") AS "topicTitle",
      s."title" AS "subtopicTitle",
      false AS "isPreviouslySkipped",
      (sol."id" IS NOT NULL) AS "hasSolution",
      CASE
        WHEN jsonb_typeof(sol."steps") = 'array' THEN jsonb_array_length(sol."steps")
        ELSE 0
      END AS "stepsCount"
    FROM public."Question" q
    LEFT JOIN public."Subtopic" s ON s."id" = q."subtopic_id"
    LEFT JOIN public."Topic" t ON t."id" = s."topicId"
    LEFT JOIN public."Topic" t_direct ON t_direct."id" = q."topic_id"
    LEFT JOIN public."Subtest" sub ON sub."id" = q."subtest_id"
    LEFT JOIN public."TryOut" tout ON tout."id" = q."tryoutId"
    LEFT JOIN public."TryOut" sub_tout ON sub_tout."id" = sub."try_out_id"
    LEFT JOIN public."QuestionSolution" sol ON sol."questionId" = q."id"
    WHERE COALESCE(q."status", 'DRAFT') = 'READY'
      AND TRIM(COALESCE(q."content", '')) <> ''
      AND COALESCE(tout."status"::text, sub_tout."status"::text, '') NOT IN ('NOT_STARTED', 'IN_PROGRESS')
      ${exclusionClauses.length > 0 ? `AND ${exclusionClauses.join(" AND ")}` : ""}
    ORDER BY RANDOM()
    LIMIT ${limitParam}
  `;

  const { rows } = await pool.query(query, values);

  return rows.map((r) => ({
    id: String(r.id),
    subtest: String(r.subtest),
    difficulty: String(r.difficulty || "MEDIUM"),
    type: String(r.type || "MULTIPLE_CHOICE"),
    points: Number(r.points) || 1,
    topicTitle: r.topicTitle || null,
    subtopicTitle: r.subtopicTitle || null,
    pattern: r.pattern || null,
    batch: r.batch ? String(r.batch).trim() || null : null,
    narration: r.narration || null,
    content: String(r.content || ""),
    imageUrl: r.imageUrl || null,
    options: [],
    hasSolution: Boolean(r.hasSolution),
    stepsCount: Number(r.stepsCount) || 0,
    isPreviouslySkipped: false,
  }));
}

export async function skipPracticeQuestion(
  userId: string,
  questionId: string
): Promise<{ skipped: boolean; questionId: string }> {
  const pool = getDbPool();
  await pool.query(
    `INSERT INTO public."PracticeAttempt" ("id", "user_id", "question_id", "status", "updated_at")
     VALUES ($1, $2, $3, 'SKIPPED', CURRENT_TIMESTAMP)
     ON CONFLICT ("user_id", "question_id")
     DO UPDATE SET "status" = 'SKIPPED', "updated_at" = CURRENT_TIMESTAMP
     WHERE public."PracticeAttempt"."status" <> 'ANSWERED'`,
    [randomUUID(), userId, questionId]
  );
  return { skipped: true, questionId };
}

export async function evaluatePracticeAnswer(
  questionId: string,
  selectedOptionId: string | null,
  options?: {
    userId?: string | null;
    inputText?: string | null;
    revealOnly?: boolean;
    sandbox?: boolean;
    sandboxTokenValid?: boolean;
  }
): Promise<PracticeEvaluationResult> {
  const pool = getDbPool();
  const userId = options?.userId || null;
  const inputText = options?.inputText ? String(options.inputText).trim() : null;
  const revealOnly = Boolean(options?.revealOnly);

  const ctx = await getUserPracticeContext(userId);

  const [qRes, optRes] = await Promise.all([
    pool.query(
      `SELECT
        q."id", q."type", COALESCE(q."status", 'DRAFT') AS "status", q."correct_answer_short_answer" AS "correctAnswerShort",
        sol."id" AS "solutionId", sol."steps" AS "solutionSteps",
        sol."staticContent" AS "solutionStaticContent", sol."quickTrick" AS "solutionQuickTrick",
        sol."keyFormula" AS "solutionKeyFormula", sol."defaultView" AS "solutionDefaultView"
      FROM public."Question" q
      LEFT JOIN public."QuestionSolution" sol ON sol."questionId" = q."id"
      WHERE q."id" = $1
      LIMIT 1`,
      [questionId]
    ),
    pool.query(
      `SELECT "id", "content", "is_correct" AS "isCorrect", "order"
       FROM public."QuestionItem"
       WHERE "question_id" = $1
       ORDER BY "order" ASC`,
      [questionId]
    ),
  ]);

  const q = qRes.rows[0];
  if (!q) {
    return {
      limitReached: false,
      isCorrect: false,
      correctOptionId: null,
      correctAnswerText: null,
      solution: null,
      dailyAnsweredCount: ctx.dailyAnsweredCount,
      dailyLimit: ctx.dailyLimit,
      isPremium: ctx.isPremium,
      totalAnswered: ctx.totalAnswered,
    };
  }

  const isSandboxEvaluation =
    Boolean(options?.sandbox) &&
    String(q.status || "DRAFT").toUpperCase() === "QC_SANDBOX" &&
    (ctx.isSandbox || Boolean(options?.sandboxTokenValid));

  // Enforce daily free limit strictly on the server for regular practice (never in Sandbox preview)
  if (!isSandboxEvaluation) {
    let alreadyAnswered = false;
    if (userId) {
      const existingRes = await pool.query(
        `SELECT "status" FROM public."PracticeAttempt" WHERE "user_id" = $1 AND "question_id" = $2 LIMIT 1`,
        [userId, questionId]
      );
      alreadyAnswered = existingRes.rows[0]?.status === "ANSWERED";
    }

    if (userId && !ctx.isPremium && !alreadyAnswered && ctx.dailyAnsweredCount >= ctx.dailyLimit) {
      return {
        limitReached: true,
        isCorrect: false,
        correctOptionId: null,
        correctAnswerText: null,
        solution: null,
        dailyAnsweredCount: ctx.dailyAnsweredCount,
        dailyLimit: ctx.dailyLimit,
        isPremium: false,
        totalAnswered: ctx.totalAnswered,
      };
    }
  }

  const isShort = q.type === "SHORT_ANSWER" || q.type === "ISIAN_SINGKAT";
  const correctOpt = optRes.rows.find((o) => Boolean(o.isCorrect));
  const correctOptionId = correctOpt ? String(correctOpt.id) : null;
  const correctAnswerText = isShort
    ? q.correctAnswerShort
      ? String(q.correctAnswerShort)
      : null
    : correctOpt
    ? String(correctOpt.content)
    : null;

  let isCorrect = false;
  if (!revealOnly) {
    if (isShort) {
      isCorrect =
        Boolean(inputText) &&
        Boolean(q.correctAnswerShort) &&
        normalizeAnswerText(inputText) === normalizeAnswerText(q.correctAnswerShort);
    } else if (selectedOptionId && correctOptionId) {
      isCorrect = String(selectedOptionId) === correctOptionId;
    }
  }

  // Persist ANSWERED attempt only in regular mode (keep QC testing non-destructive)
  if (!isSandboxEvaluation && userId) {
    await pool.query(
      `INSERT INTO public."PracticeAttempt" (
        "id", "user_id", "question_id", "status", "selected_option_id", "input_text",
        "is_correct", "is_reveal_only", "answered_at", "updated_at"
      )
      VALUES ($1, $2, $3, 'ANSWERED', $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("user_id", "question_id")
      DO UPDATE SET
        "status" = 'ANSWERED',
        "selected_option_id" = COALESCE(EXCLUDED."selected_option_id", public."PracticeAttempt"."selected_option_id"),
        "input_text" = COALESCE(EXCLUDED."input_text", public."PracticeAttempt"."input_text"),
        "is_correct" = CASE
          WHEN public."PracticeAttempt"."status" = 'ANSWERED' THEN public."PracticeAttempt"."is_correct"
          ELSE EXCLUDED."is_correct"
        END,
        "is_reveal_only" = CASE
          WHEN public."PracticeAttempt"."status" = 'ANSWERED' THEN public."PracticeAttempt"."is_reveal_only"
          ELSE EXCLUDED."is_reveal_only"
        END,
        "answered_at" = COALESCE(public."PracticeAttempt"."answered_at", CURRENT_TIMESTAMP),
        "updated_at" = CURRENT_TIMESTAMP`,
      [
        randomUUID(),
        userId,
        questionId,
        selectedOptionId || null,
        inputText || null,
        isCorrect,
        revealOnly,
      ]
    );
  }

  const updatedCtx = !isSandboxEvaluation && userId ? await getUserPracticeContext(userId) : ctx;

  return {
    limitReached: false,
    isCorrect,
    correctOptionId,
    correctAnswerText,
    solution: mapSolutionRow(q),
    dailyAnsweredCount: updatedCtx.dailyAnsweredCount,
    dailyLimit: updatedCtx.dailyLimit,
    isPremium: updatedCtx.isPremium,
    totalAnswered: updatedCtx.totalAnswered,
  };
}

export async function getPracticeHistory(
  userId: string,
  params?: { subtest?: string; search?: string }
): Promise<{
  locked: boolean;
  isPremium: boolean;
  totalAnswered: number;
  items: PracticeHistoryItem[];
}> {
  const ctx = await getUserPracticeContext(userId);
  if (!ctx.isPremium) {
    return {
      locked: true,
      isPremium: false,
      totalAnswered: ctx.totalAnswered,
      items: [],
    };
  }

  const pool = getDbPool();
  const values: any[] = [userId];
  const clauses: string[] = [`pat."user_id" = $1`, `pat."status" = 'ANSWERED'`];

  const subtestAliases = expandSubtestAliases(params?.subtest);
  if (subtestAliases.length > 0) {
    values.push(subtestAliases);
    clauses.push(`UPPER(q."subtest") = ANY($${values.length}::text[])`);
  }

  if (params?.search && params.search.trim()) {
    values.push(`%${params.search.trim()}%`);
    const p = `$${values.length}`;
    clauses.push(
      `(q."content" ILIKE ${p} OR COALESCE(q."narration", '') ILIKE ${p} OR COALESCE(t."title", t_direct."title", '') ILIKE ${p} OR COALESCE(s."title", '') ILIKE ${p})`
    );
  }

  const query = `
    SELECT
      pat."id" AS "attemptId",
      pat."question_id" AS "questionId",
      pat."selected_option_id" AS "selectedOptionId",
      pat."input_text" AS "inputText",
      COALESCE(pat."is_correct", false) AS "isCorrect",
      COALESCE(pat."is_reveal_only", false) AS "isRevealOnly",
      pat."answered_at" AS "answeredAt",
      q."subtest",
      q."difficulty",
      q."type",
      q."points",
      q."narration",
      q."content",
      q."imageUrl",
      q."correct_answer_short_answer" AS "correctAnswerShort",
      COALESCE(t."title", t_direct."title") AS "topicTitle",
      s."title" AS "subtopicTitle",
      sol."id" AS "solutionId",
      sol."steps" AS "solutionSteps",
      sol."staticContent" AS "solutionStaticContent",
      sol."quickTrick" AS "solutionQuickTrick",
      sol."keyFormula" AS "solutionKeyFormula",
      sol."defaultView" AS "solutionDefaultView",
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', opt."id",
              'content', opt."content",
              'order', opt."order",
              'isCorrect', opt."is_correct"
            ) ORDER BY opt."order" ASC
          )
          FROM public."QuestionItem" opt
          WHERE opt."question_id" = q."id"
        ),
        '[]'::json
      ) AS "options"
    FROM public."PracticeAttempt" pat
    JOIN public."Question" q ON q."id" = pat."question_id"
    LEFT JOIN public."Subtopic" s ON s."id" = q."subtopic_id"
    LEFT JOIN public."Topic" t ON t."id" = s."topicId"
    LEFT JOIN public."Topic" t_direct ON t_direct."id" = q."topic_id"
    LEFT JOIN public."QuestionSolution" sol ON sol."questionId" = q."id"
    WHERE ${clauses.join(" AND ")}
    ORDER BY pat."answered_at" DESC NULLS LAST, pat."updated_at" DESC
    LIMIT 200
  `;

  const { rows } = await pool.query(query, values);

  const items: PracticeHistoryItem[] = rows.map((r) => {
    const opts = Array.isArray(r.options) ? r.options : [];
    const correctOpt = opts.find((o: any) => Boolean(o.isCorrect));
    const isShort = r.type === "SHORT_ANSWER" || r.type === "ISIAN_SINGKAT";
    return {
      attemptId: String(r.attemptId),
      questionId: String(r.questionId),
      subtest: String(r.subtest),
      difficulty: String(r.difficulty || "MEDIUM"),
      type: String(r.type || "MULTIPLE_CHOICE"),
      points: Number(r.points) || 1,
      topicTitle: r.topicTitle || null,
      subtopicTitle: r.subtopicTitle || null,
      narration: r.narration || null,
      content: String(r.content || ""),
      imageUrl: r.imageUrl || null,
      options: opts,
      selectedOptionId: r.selectedOptionId || null,
      inputText: r.inputText || null,
      correctOptionId: correctOpt ? String(correctOpt.id) : null,
      correctAnswerText: isShort
        ? r.correctAnswerShort || null
        : correctOpt
        ? String(correctOpt.content)
        : null,
      isCorrect: Boolean(r.isCorrect),
      isRevealOnly: Boolean(r.isRevealOnly),
      answeredAt: r.answeredAt ? new Date(r.answeredAt).toISOString() : new Date().toISOString(),
      solution: mapSolutionRow(r),
    };
  });

  return {
    locked: false,
    isPremium: true,
    totalAnswered: ctx.totalAnswered,
    items,
  };
}

export type ApproveSandboxResult = {
  approved: boolean;
  questionId: string;
  status: string;
  target: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  error?: string;
  statusCode?: number;
};

/**
 * Transitions a QC_SANDBOX question directly to READY from Main Sandbox QC preview.
 * Validates existing status before updating and mirrors Control Center APPROVE semantics.
 */
export async function approveSandboxQuestion(
  questionId: string,
  reviewerLabel: string
): Promise<ApproveSandboxResult> {
  const cleanId = String(questionId || "").trim();
  const cleanReviewer = String(reviewerLabel || "").trim() || "QC Sandbox";
  const pool = getDbPool();

  const existingRes = await pool.query(
    `SELECT "id", COALESCE("status", 'DRAFT') AS "status", COALESCE("target", 'DRAFT') AS "target"
     FROM public."Question"
     WHERE "id" = $1
     LIMIT 1`,
    [cleanId]
  );

  if (existingRes.rows.length === 0) {
    return {
      approved: false,
      questionId: cleanId,
      status: "UNKNOWN",
      target: "UNKNOWN",
      reviewedBy: null,
      reviewedAt: null,
      error: "Soal tidak ditemukan.",
      statusCode: 404,
    };
  }

  const existingStatus = String(existingRes.rows[0].status || "DRAFT").toUpperCase();
  if (existingStatus !== "QC_SANDBOX") {
    return {
      approved: false,
      questionId: cleanId,
      status: existingStatus,
      target: String(existingRes.rows[0].target || "DRAFT"),
      reviewedBy: null,
      reviewedAt: null,
      error:
        existingStatus === "READY"
          ? "Soal ini sudah berstatus READY."
          : `Hanya soal Antrean QC (QC_SANDBOX) yang bisa di-ACC langsung (status saat ini: ${existingStatus}).`,
      statusCode: 400,
    };
  }

  const updatedRes = await pool.query(
    `UPDATE public."Question"
     SET
       "status" = 'READY',
       "target" = CASE
         WHEN COALESCE("target", 'DRAFT') IN ('DRAFT', 'SANDBOX') THEN 'BANK'
         ELSE "target"
       END,
       "revision_notes" = NULL,
       "reviewed_by" = $2,
       "reviewed_at" = CURRENT_TIMESTAMP,
       "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $1
       AND COALESCE("status", 'DRAFT') = 'QC_SANDBOX'
     RETURNING
       "id",
       COALESCE("status", 'READY') AS "status",
       COALESCE("target", 'BANK') AS "target",
       "reviewed_by" AS "reviewedBy",
       "reviewed_at" AS "reviewedAt"`,
    [cleanId, cleanReviewer]
  );

  if (updatedRes.rows.length === 0) {
    return {
      approved: false,
      questionId: cleanId,
      status: existingStatus,
      target: String(existingRes.rows[0].target || "DRAFT"),
      reviewedBy: null,
      reviewedAt: null,
      error: "Status soal berubah sebelum proses ACC selesai. Muat ulang halaman.",
      statusCode: 409,
    };
  }

  const row = updatedRes.rows[0];
  return {
    approved: true,
    questionId: String(row.id),
    status: String(row.status),
    target: String(row.target),
    reviewedBy: row.reviewedBy ? String(row.reviewedBy) : null,
    reviewedAt: row.reviewedAt ? new Date(row.reviewedAt).toISOString() : null,
  };
}
