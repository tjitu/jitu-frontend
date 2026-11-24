export function isTryoutBeforeStart(
  tryout: { startDate?: string | null; canBypassSchedule?: boolean; latestAttemptStatus?: string | null },
  now = Date.now(),
): boolean {
  if (tryout.canBypassSchedule || tryout.latestAttemptStatus === 'FINISHED' || !tryout.startDate) return false;
  const start = Date.parse(tryout.startDate);
  return Number.isFinite(start) && now < start;
}

export function tryoutStartDetailUrl(id: string, scheduledStart?: Date | string | null, now = Date.now()): string {
  const base = `/tryout/${encodeURIComponent(id)}`;
  const start = scheduledStart instanceof Date ? scheduledStart.getTime() : scheduledStart ? Date.parse(scheduledStart) : NaN;
  return Number.isFinite(start) && now < start ? `${base}?belumDimulai=1` : base;
}
