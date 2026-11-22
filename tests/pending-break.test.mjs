import assert from "node:assert/strict";
import test from "node:test";
import { pendingBreakOrder } from "../modules/TryoutExamModule/break/pending-break.ts";

function storage(entries) {
  const values = new Map(entries);
  return {
    length: values.size,
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
  };
}

test("restores only a later break of the current attempt", () => {
  const saved = storage([
    ["break_started_at_other_2", "2026-11-21T00:00:00Z"],
    ["break_started_at_attempt_1", "2026-11-21T00:00:00Z"],
    ["break_started_at_attempt_3", "invalid"],
    ["break_started_at_attempt_4", "2026-11-21T00:00:00Z"],
    ["break_started_at_attempt_2", "2026-11-21T00:00:00Z"],
  ]);
  assert.equal(pendingBreakOrder(saved, "attempt", 1), 2);
  assert.equal(pendingBreakOrder(saved, "attempt", 2), 4);
  assert.equal(pendingBreakOrder(saved, "attempt", 4), null);
  assert.equal(pendingBreakOrder(saved, "unknown", 1), null);
});
