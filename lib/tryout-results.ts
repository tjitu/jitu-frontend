/** Results are available at the scheduled end; a missing date is not a release. */
export function areTryoutResultsAvailable(scheduledEnd: Date | string | null | undefined, now = Date.now()): boolean {
  if (!scheduledEnd) return false;
  const end = new Date(scheduledEnd).getTime();
  return Number.isFinite(end) && now >= end;
}
