export interface SubtestTiming {
  order: number;
  durationMinutes: number;
}

export interface AttemptSummaryRow {
  id: string;
  status: string;
  startedAt: Date | string;
  finishedAt?: Date | string | null;
  totalScore?: number | null;
  currentSubtestOrder?: number | null;
  subtestStartedAt?: Date | string | null;
}

export interface AttemptProgressResult {
  status: string | undefined;
  latestAttemptId: string | null;
  latestFinishedAttemptId: string | null;
  isWaitingTransition: boolean;
  nextSubtestOrder: number | null;
  resumeUrl: string | null;
  needAutoFinish: boolean;
  score: number | undefined;
}

export function computeAttemptProgress(
  tryoutId: string,
  latestAttempt: AttemptSummaryRow | null,
  latestFinished: { id: string; totalScore?: number | null } | null,
  subtests: SubtestTiming[],
  scheduledEnd: Date | string | null | undefined,
  nowMs: number = Date.now(),
): AttemptProgressResult {
  const ordered = [...subtests].sort((a, b) => a.order - b.order);
  let status = latestAttempt?.status;
  let isWaitingTransition = false;
  let nextSubtestOrder: number | null = null;
  let resumeUrl: string | null = null;
  let needAutoFinish = false;

  const endMs = scheduledEnd ? new Date(scheduledEnd).getTime() : null;
  const scheduleEnded = Boolean(endMs && !Number.isNaN(endMs) && nowMs > endMs);

  if (status === "IN_PROGRESS" && latestAttempt) {
    if (scheduleEnded) {
      status = "FINISHED";
      needAutoFinish = true;
      resumeUrl = `/tryout/${tryoutId}`;
    } else {
      const currentOrder = Number(latestAttempt.currentSubtestOrder) || 1;
      const activeSubtest = ordered.find((s) => s.order === currentOrder);
      const timerStartMs = latestAttempt.subtestStartedAt
        ? new Date(latestAttempt.subtestStartedAt).getTime()
        : new Date(latestAttempt.startedAt).getTime();
      const timerEndMs =
        timerStartMs + (Number(activeSubtest?.durationMinutes) || 0) * 60_000;

      if (activeSubtest && nowMs >= timerEndMs) {
        const nextSubtest = ordered.find((s) => s.order > currentOrder);
        if (nextSubtest) {
          isWaitingTransition = true;
          nextSubtestOrder = nextSubtest.order;
          resumeUrl = `/tryout/${tryoutId}/break/${nextSubtest.order}?attemptId=${encodeURIComponent(latestAttempt.id)}&expired=true`;
        } else {
          status = "FINISHED";
          needAutoFinish = true;
          resumeUrl = `/tryout/${tryoutId}`;
        }
      } else {
        resumeUrl = `/tryout/${tryoutId}/exam/${currentOrder}?attemptId=${encodeURIComponent(latestAttempt.id)}`;
      }
    }
  } else if (status === "FINISHED" && (latestFinished || latestAttempt)) {
    const finishedId = latestFinished?.id ?? latestAttempt?.id;
    if (finishedId) {
      resumeUrl = `/tryout/${tryoutId}`;
    }
  }

  return {
    status,
    latestAttemptId: latestAttempt?.id ?? null,
    latestFinishedAttemptId:
      latestFinished?.id ??
      (status === "FINISHED" ? latestAttempt?.id ?? null : null),
    isWaitingTransition,
    nextSubtestOrder,
    resumeUrl,
    needAutoFinish,
    score:
      latestFinished?.totalScore != null
        ? Number(latestFinished.totalScore)
        : latestAttempt?.totalScore != null
          ? Number(latestAttempt.totalScore)
          : undefined,
  };
}

export async function triggerAutoFinishIfNeeded(
  attemptIds: string[],
  authorizationHeader: string | null,
): Promise<void> {
  if (!attemptIds.length || !authorizationHeader) return;
  const backendUrl =
    process.env.NESTJS_BACKEND_URL || "http://localhost:3000";

  await Promise.all(
    attemptIds.map((id) =>
      fetch(`${backendUrl}/exam/finish/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { Authorization: authorizationHeader },
        signal: AbortSignal.timeout(4000),
      }).catch(() => undefined),
    ),
  );
}
