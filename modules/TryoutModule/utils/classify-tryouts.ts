import { TryOutData } from "../types";

export interface ClassifiedTryouts {
  ongoing: TryOutData[];
  others: TryOutData[];
}

/**
 * Classifies tryouts into ongoing (currently active) and others (upcoming, past, etc.).
 * Guarantees that active/live tryouts get featured at the top in full-width landscape.
 */
export function classifyTryouts(
  tryouts: TryOutData[],
  now = new Date()
): ClassifiedTryouts {
  if (tryouts.length === 0) {
    return { ongoing: [], others: [] };
  }

  const currentTime = now.getTime();

  // 1. Strictly ongoing (start in past/now, end in future/now)
  const strictlyOngoing = tryouts.filter((t) => {
    if (!t.scheduledStart) return false;
    const start = new Date(t.scheduledStart).getTime();
    if (currentTime < start) return false;
    if (t.scheduledEnd) {
      const end = new Date(t.scheduledEnd).getTime();
      if (currentTime > end) return false;
    }
    return true;
  });

  if (strictlyOngoing.length > 0) {
    const ongoingIds = new Set(strictlyOngoing.map((t) => t.id));
    return {
      ongoing: strictlyOngoing,
      others: tryouts.filter((t) => !ongoingIds.has(t.id)),
    };
  }

  // 2. If no tryout is strictly ongoing (e.g. test database dates or ongoing without end date):
  // Any tryout whose start date has arrived is active
  const startedTryouts = tryouts.filter((t) => {
    if (!t.scheduledStart) return true;
    return currentTime >= new Date(t.scheduledStart).getTime();
  });

  if (startedTryouts.length > 0) {
    const featuredOngoing = startedTryouts[0];
    return {
      ongoing: [featuredOngoing],
      others: tryouts.filter((t) => t.id !== featuredOngoing.id),
    };
  }

  // 3. Otherwise (e.g. all tryouts are in future)
  return {
    ongoing: [],
    others: tryouts,
  };
}
