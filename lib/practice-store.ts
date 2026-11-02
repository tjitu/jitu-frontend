import pg from "pg";
import { getDbPool } from "./db";

export type PracticeOption = {
  id: string;
  content: string;
  order: number;
};

export type SolutionStep = {
  stepNumber: number;
  category: string;
  title: string;
  content: string;
};

export type QuestionSolutionData = {
  id: string;
  steps: SolutionStep[];
  quickTrick?: string | null;
  keyFormula?: string | null;
  staticContent?: string | null;
};

export type PracticeQuestionSummary = {
  id: string;
  subtest: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topicTitle?: string | null;
  subtopicTitle?: string | null;
  narration?: string | null;
  content: string;
  imageUrl?: string | null;
  points: number;
  options: PracticeOption[];
  stepsCount: number;
  hasTrick: boolean;
  hasFormula: boolean;
};

export async function getPracticeQuestions(params: {
  subtest?: string;
  difficulty?: string;
  search?: string;
}): Promise<PracticeQuestionSummary[]> {
  const pool = getDbPool();
  const whereClauses: string[] = ["(q.target = 'FOR_PRACTICE' OR q.target IS NULL)"];
  const values: any[] = [];
  let paramIdx = 1;

  if (params.subtest && params.subtest !== "ALL") {
    whereClauses.push(`q.subtest = $${paramIdx++}`);
    values.push(params.subtest);
  }

  if (params.difficulty && params.difficulty !== "ALL") {
    whereClauses.push(`q.difficulty = $${paramIdx++}`);
    values.push(params.difficulty);
  }

  if (params.search && params.search.trim()) {
    whereClauses.push(`(q.content ILIKE $${paramIdx} OR q.narration ILIKE $${paramIdx})`);
    values.push(`%${params.search.trim()}%`);
    paramIdx++;
  }

  const query = `
    SELECT 
      q.id,
      q.subtest,
      q.difficulty,
      q.narration,
      q.content,
      q."imageUrl",
      COALESCE(q.points, 1) as points,
      s.title as "subtopicTitle",
      t.title as "topicTitle",
      COALESCE(json_agg(
        json_build_object(
          'id', opt.id,
          'content', opt.content,
          'order', opt."order"
        ) ORDER BY opt."order" ASC
      ) FILTER (WHERE opt.id IS NOT NULL), '[]'::json) as options,
      sol.steps,
      sol."quickTrick",
      sol."keyFormula"
    FROM "Question" q
    LEFT JOIN "Subtopic" s ON s.id = q.subtopic_id
    LEFT JOIN "Topic" t ON t.id = s."topicId"
    LEFT JOIN "QuestionItem" opt ON opt.question_id = q.id
    LEFT JOIN "QuestionSolution" sol ON sol."questionId" = q.id
    WHERE ${whereClauses.join(" AND ")}
    GROUP BY q.id, s.title, t.title, sol.id
    ORDER BY q."createdAt" ASC
    LIMIT 50;
  `;

  const { rows } = await pool.query(query, values);

  return rows.map((r) => {
    const rawSteps = Array.isArray(r.steps) ? r.steps : [];
    return {
      id: r.id,
      subtest: r.subtest || "PENALARAN_MATEMATIKA",
      difficulty: r.difficulty || "MEDIUM",
      topicTitle: r.topicTitle || null,
      subtopicTitle: r.subtopicTitle || null,
      narration: r.narration || null,
      content: r.content,
      imageUrl: r.imageUrl || null,
      points: Number(r.points) || 1,
      options: Array.isArray(r.options) ? r.options : [],
      stepsCount: rawSteps.length,
      hasTrick: Boolean(r.quickTrick),
      hasFormula: Boolean(r.keyFormula),
    };
  });
}

export async function evaluatePracticeAnswer(
  questionId: string,
  selectedOptionId?: string | null
): Promise<{
  isCorrect: boolean;
  correctOptionId: string | null;
  solution: QuestionSolutionData | null;
}> {
  const pool = getDbPool();

  // Find correct option for this question
  const optRes = await pool.query(
    `SELECT id, is_correct FROM "QuestionItem" WHERE question_id = $1`,
    [questionId]
  );

  const selectedOpt = selectedOptionId
    ? optRes.rows.find((o) => o.id === selectedOptionId)
    : null;
  const correctOpt = optRes.rows.find((o) => o.is_correct === true);

  const isCorrect = Boolean(selectedOpt?.is_correct);

  // Fetch full interactive solution deck
  const solRes = await pool.query(
    `SELECT id, steps, "quickTrick", "keyFormula", "staticContent"
     FROM "QuestionSolution"
     WHERE "questionId" = $1`,
    [questionId]
  );

  let solution: QuestionSolutionData | null = null;
  if (solRes.rows.length > 0) {
    const raw = solRes.rows[0];
    const steps = Array.isArray(raw.steps) ? raw.steps : [];
    solution = {
      id: raw.id,
      steps,
      quickTrick: raw.quickTrick || null,
      keyFormula: raw.keyFormula || null,
      staticContent: raw.staticContent || null,
    };
  }

  return {
    isCorrect,
    correctOptionId: correctOpt?.id || null,
    solution,
  };
}

