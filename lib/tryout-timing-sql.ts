// Prisma writes UTC into TIMESTAMP WITHOUT TIME ZONE columns. Return instants
// to pg so a Next.js server running in WIB reads the same deadline as the API.
export const ATTEMPT_TIMESTAMPS = `
  started_at AT TIME ZONE 'UTC' AS "startedAt",
  subtest_started_at AT TIME ZONE 'UTC' AS "subtestStartedAt",
  finished_at AT TIME ZONE 'UTC' AS "finishedAt"`;

export const TRYOUT_SCHEDULE = `
  t."scheduledStart" AT TIME ZONE 'UTC' AS "scheduledStart",
  t."scheduledEnd" AT TIME ZONE 'UTC' AS "scheduledEnd"`;
