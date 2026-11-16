import type { TryOutData } from "../types";

export interface TryoutCardActionInfo {
  badgeLabel: string;
  badgeVariant: "sandbox" | "finished" | "in_progress" | "not_started" | "unregistered";
  ctaLabel: string;
  targetUrl: string;
  isOutline: boolean;
}

export function getTryoutCardActionInfo(tryout: TryOutData): TryoutCardActionInfo {
  const status = tryout.latestAttemptStatus;

  if (tryout.isSandboxPreview || tryout.curationStatus === "QC_SANDBOX") {
    return {
      badgeLabel: "QC Sandbox",
      badgeVariant: "sandbox",
      ctaLabel: tryout.isRegistered ? "Kerjakan tryout" : "Daftar tryout",
      targetUrl: `/tryout/${tryout.id}`,
      isOutline: false,
    };
  }

  if (status === "FINISHED") {
    const resultUrl = tryout.resumeUrl || `/tryout/${tryout.id}`;
    return {
      badgeLabel: "Selesai",
      badgeVariant: "finished",
      ctaLabel: "Review Hasil",
      targetUrl: resultUrl,
      isOutline: true,
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      badgeLabel: "Sedang mengerjakan",
      badgeVariant: "in_progress",
      ctaLabel: "Lanjutkan Tryout",
      targetUrl: tryout.resumeUrl || `/tryout/${tryout.id}`,
      isOutline: false,
    };
  }

  if (tryout.isRegistered) {
    return {
      badgeLabel: "Belum mulai",
      badgeVariant: "not_started",
      ctaLabel: "Kerjakan tryout",
      targetUrl: `/tryout/${tryout.id}`,
      isOutline: false,
    };
  }

  return {
    badgeLabel: "Belum terdaftar",
    badgeVariant: "unregistered",
    ctaLabel: "Daftar tryout",
    targetUrl: `/tryout/${tryout.id}`,
    isOutline: false,
  };
}
