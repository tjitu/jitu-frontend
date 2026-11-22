import assert from "node:assert/strict";
import { test } from "node:test";
import { areTryoutResultsAvailable } from "./tryout-results";
import { computeAttemptProgress } from "./tryout-attempt-helper";

const end = "2026-11-23T12:00:00Z";
const endMs = Date.parse(end);
const finished = { id: "attempt", status: "FINISHED", startedAt: end, totalScore: 750 };

test("release requires a valid scheduled end and includes its exact boundary", () => {
  assert.equal(areTryoutResultsAvailable(end, endMs - 1), false);
  assert.equal(areTryoutResultsAvailable(end, endMs), true);
  assert.equal(areTryoutResultsAvailable(null, endMs), false);
  assert.equal(areTryoutResultsAvailable("invalid", endMs), false);
});

test("attempt progress does not expose scores before release", () => {
  assert.equal(computeAttemptProgress("tryout", finished, finished, [], end, endMs - 1).score, undefined);
  assert.equal(computeAttemptProgress("tryout", finished, finished, [], end, endMs).score, 750);
  assert.equal(computeAttemptProgress("tryout", finished, finished, [], null, endMs).score, undefined);
});
