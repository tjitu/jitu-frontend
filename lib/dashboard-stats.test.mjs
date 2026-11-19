import assert from "node:assert/strict";
import test from "node:test";
import { learningStreak } from "./dashboard-stats.ts";

test("streak counts active days once across Jakarta midnight", () => {
  const days = ["2026-11-18", "2026-11-19", "2026-11-19", "2026-11-20"];
  assert.equal(learningStreak(days, new Date("2026-11-19T16:59:59Z")), 2);
  assert.equal(learningStreak(days, new Date("2026-11-19T17:00:00Z")), 3);
});

test("yesterday retains a streak until the next Jakarta day", () => {
  const days = ["2026-11-18", "2026-11-19"];
  assert.equal(learningStreak(days, new Date("2026-11-20T16:59:59Z")), 2);
  assert.equal(learningStreak(days, new Date("2026-11-20T17:00:00Z")), 0);
});

test("an interrupted streak restarts on the next active day", () => {
  assert.equal(learningStreak(["2026-11-17", "2026-11-19"], new Date("2026-11-19T05:00:00Z")), 1);
  assert.equal(learningStreak([], new Date("2026-11-19T05:00:00Z")), 0);
});
