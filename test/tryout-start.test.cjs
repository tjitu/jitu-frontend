const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isTryoutBeforeStart, tryoutStartDetailUrl } = require('../lib/tryout-start.ts');
const startDate = '2030-01-01T02:00:00.000Z';
test('blocks a normal participant before start and allows them at the scheduled time', () => {
  assert.equal(isTryoutBeforeStart({startDate}, Date.parse('2030-01-01T01:59:59Z')), true);
  assert.equal(isTryoutBeforeStart({startDate}, Date.parse(startDate)), false);
});
test('allows sandbox or admin simulation and completed-attempt review', () => {
  const now = Date.parse('2030-01-01T01:00:00Z');
  assert.equal(isTryoutBeforeStart({startDate, canBypassSchedule:true}, now), false);
  assert.equal(isTryoutBeforeStart({startDate, latestAttemptStatus:'FINISHED'}, now), false);
});
test('does not block when the schedule is missing or invalid', () => {
  assert.equal(isTryoutBeforeStart({}, 0), false);
  assert.equal(isTryoutBeforeStart({startDate:'invalid'}, 0), false);
});
test('dashboard links request the modal only before the start', () => {
  assert.equal(tryoutStartDetailUrl('test', startDate, Date.parse('2030-01-01T01:00:00Z')), '/tryout/test?belumDimulai=1');
  assert.equal(tryoutStartDetailUrl('test', new Date(startDate), Date.parse(startDate)), '/tryout/test');
});
