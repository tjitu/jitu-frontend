import type { TryoutDetail } from "@/modules/TryoutDetailModule/interface";

type BreakDetail = Pick<TryoutDetail, "id" | "categories" | "latestAttemptId" |
  "latestAttemptStatus" | "currentSubtestOrder" | "resumeUrl" | "isWaitingTransition">;

export function resolveBreak(detail: BreakDetail, attemptId: string, order: number, expiredLink: boolean) {
  const detailUrl = `/tryout/${encodeURIComponent(detail.id)}`;
  if (detail.latestAttemptId !== attemptId || detail.latestAttemptStatus !== "IN_PROGRESS") {
    return { redirect: detailUrl } as const;
  }

  const currentOrder = detail.currentSubtestOrder ?? 1;
  const examUrl = `${detailUrl}/exam/${currentOrder}?attemptId=${encodeURIComponent(attemptId)}`;
  const resumeUrl = detail.resumeUrl || examUrl;
  if (resumeUrl === detailUrl || (expiredLink && !detail.isWaitingTransition)) {
    return { redirect: resumeUrl } as const;
  }

  const populated = detail.categories.filter((subtest) => subtest.questionCount > 0);
  const subtests = [...(populated.length ? populated : detail.categories)].sort((a, b) => a.id - b.id);
  const nextIndex = subtests.findIndex((subtest) => subtest.id > currentOrder);
  if (nextIndex < 0 || subtests[nextIndex].id !== order) {
    return { redirect: resumeUrl } as const;
  }
  return { subtests, nextIndex } as const;
}
