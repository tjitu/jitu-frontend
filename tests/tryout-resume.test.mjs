import assert from "node:assert/strict";
import test from "node:test";
import { getDbPool } from "../lib/db.ts";
import { computeAttemptProgress } from "../lib/tryout-attempt-helper.ts";
import { ATTEMPT_TIMESTAMPS, TRYOUT_SCHEDULE } from "../lib/tryout-timing-sql.ts";

const start = new Date("2026-11-19T05:00:00.000Z");
const attempt = { id: "run", status: "IN_PROGRESS", currentSubtestOrder: 1, startedAt: start, subtestStartedAt: start };
const subtests = [{ order: 1, durationMinutes: 30 }, { order: 3, durationMinutes: 15 }];
const examUrl = "/tryout/snbt/exam/1?attemptId=run";
const breakUrl = "/tryout/snbt/break/3?attemptId=run&expired=true";

function progressAt(elapsedMs, row = attempt, scheduledEnd = null) {
  return computeAttemptProgress("snbt", row, null, subtests, scheduledEnd, start.getTime() + elapsedMs);
}

test("a short absence keeps the active subtest until its original deadline", () => {
  for (const elapsedMs of [30_000, 60_000, 1_799_999]) {
    const progress = progressAt(elapsedMs);
    assert.equal(progress.resumeUrl, examUrl);
    assert.equal(progress.needAutoFinish, false);
  }
  assert.equal(progressAt(1_800_000).resumeUrl, breakUrl);
  assert.equal(progressAt(30_000, { ...attempt, subtestStartedAt: null }).resumeUrl, examUrl);
});

test("the last subtest uses its own start and respects the tryout closing time", () => {
  const last = { ...attempt, currentSubtestOrder: 3, startedAt: new Date(start.getTime() - 7_200_000) };
  assert.equal(progressAt(30_000, last).resumeUrl, "/tryout/snbt/exam/3?attemptId=run");
  assert.equal(progressAt(900_000, last).needAutoFinish, true);
  assert.equal(progressAt(30_000, last, new Date(start.getTime() + 29_999)).needAutoFinish, true);
});

test("the PostgreSQL projections preserve Prisma UTC timestamps on a WIB host", {
  skip: !process.env.DATABASE_URL && "requires PostgreSQL (only queries literal test values)",
}, async () => {
  const previousZone = process.env.TZ;
  process.env.TZ = "Asia/Jakarta";
  const pool = getDbPool();
  try {
    const { rows: [row] } = await pool.query(`
      SELECT ${ATTEMPT_TIMESTAMPS}, ${TRYOUT_SCHEDULE}
      FROM (VALUES (timestamp '2026-11-19 04:00', timestamp '2026-11-19 05:00',
                    NULL::timestamp, timestamp '2026-11-18 23:00', timestamp '2026-11-19 06:00'))
      AS t(started_at, subtest_started_at, finished_at, "scheduledStart", "scheduledEnd")`);
    assert.equal(row.subtestStartedAt.toISOString(), start.toISOString());
    assert.equal(row.startedAt.toISOString(), "2026-11-19T04:00:00.000Z");
    assert.equal(row.scheduledStart.toISOString(), "2026-11-18T23:00:00.000Z");
    assert.equal(row.scheduledEnd.toISOString(), "2026-11-19T06:00:00.000Z");
    assert.equal(row.finishedAt, null);
    assert.equal(progressAt(30_000, { ...attempt, ...row }, row.scheduledEnd).resumeUrl, examUrl);
  } finally {
    await pool.end();
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});
