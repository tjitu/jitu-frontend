import assert from "node:assert/strict";
import test from "node:test";
import { resolveBreak } from "../modules/TryoutExamModule/break/resolve-break.ts";

const examUrl = "/tryout/snbt/exam/1?attemptId=run";
const breakUrl = "/tryout/snbt/break/3?attemptId=run&expired=true";

test("a stale expiry link resumes the exam while a voluntary break still works", () => {
  const detail = {
    id: "snbt", latestAttemptId: "run", latestAttemptStatus: "IN_PROGRESS",
    currentSubtestOrder: 1, isWaitingTransition: false, resumeUrl: examUrl,
    categories: [{ id: 1, questionCount: 20 }, { id: 2, questionCount: 0 }, { id: 3, questionCount: 20 }],
  };
  assert.equal(resolveBreak(detail, "run", 3, true).redirect, examUrl);
  const waiting = { ...detail, isWaitingTransition: true, resumeUrl: breakUrl };
  for (const state of [resolveBreak(detail, "run", 3, false), resolveBreak(waiting, "run", 3, true)]) {
    assert.equal(state.nextIndex, 1);
    assert.deepEqual(state.subtests.map((item) => item.id), [1, 3]);
  }
  assert.equal(resolveBreak(waiting, "run", 2, true).redirect, breakUrl);
  assert.equal(resolveBreak(waiting, "older-attempt", 3, true).redirect, "/tryout/snbt");
  assert.equal(resolveBreak({ ...waiting, latestAttemptStatus: "FINISHED" }, "run", 3, true).redirect, "/tryout/snbt");
});
