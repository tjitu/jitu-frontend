export interface TryOutData {
  verificationStatus?: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | null;
  id: string;
  title: string;
  description?: string | null;
  number: string;
  participants: number;
  badge: string;
  solutionPrice: number;
  isPublic: boolean;
  isSpecial?: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  duration?: number;
  isRegistered?: boolean;
  latestAttemptStatus?: string | null;
  latestAttemptId?: string | null;
  latestFinishedAttemptId?: string | null;
  resumeUrl?: string | null;
  isWaitingTransition?: boolean;
  nextSubtestOrder?: number | null;
  curationStatus?: string;
  isSandboxPreview?: boolean;
}
