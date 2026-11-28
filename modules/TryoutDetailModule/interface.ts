export interface TryoutDetail {
  verificationStatus?: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | null;
  unlockedSolutions: any;
  id: string;
  title: string;
  number: string;
  badge: string;
  participants: number;
  description: string;
  duration: number;
  totalQuestions: number;
  actualQuestionCount?: number;
  startDate: string;
  endDate: string;
  isRegistered: boolean;
  isFree: boolean;
  isSpecial?: boolean;
  tokenCost?: number;
  categories: CategoryDetail[];
  benefits: string[];
  requirements: string[];
  latestFinishedAttemptId: string | null;
  latestAttemptStatus: "IN_PROGRESS" | "FINISHED" | "NOT_STARTED" | null;
  latestAttemptId?: string | null;
  currentSubtestOrder?: number;
  isWaitingTransition?: boolean;
  nextSubtestOrder?: number | null;
  resumeUrl?: string | null;
  latestScore?: number | null;
  resultsAvailable?: boolean;
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
  curationStatus?: string;
  questionsReleased?: boolean;
  breakSeconds?: number;
  isSandboxPreview?: boolean;
  isSandboxAccount?: boolean;
  canBypassSchedule?: boolean;
}

export interface CategoryDetail {
  id: number;
  name: string;
  questionCount: number;
  duration: number;
  isCompleted?: boolean; // Track if subtest is completed
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
}
