import type { TryOutData } from "../types";

const FEATURED_WINDOW_MS = 24 * 60 * 60 * 1000;

export function classifyTryouts(tryouts: TryOutData[], now = new Date()) {
  const currentTime = now.getTime();
  const featured = tryouts.filter((tryout) => {
    if (!tryout.scheduledStart) return false;
    const start = new Date(tryout.scheduledStart).getTime();
    if (!Number.isFinite(start) || start > currentTime + FEATURED_WINDOW_MS) return false;
    if (!tryout.scheduledEnd) return true;
    const end = new Date(tryout.scheduledEnd).getTime();
    return Number.isFinite(end) && end >= currentTime;
  });

  return {
    featured: featured.sort((a, b) =>
      new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime()
    ),
  };
}
