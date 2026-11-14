export interface TryoutDetail {
  unlockedSolutions: any;
  id: string;
  title: string;
  number: string;
  badge: string;
  participants: number;
  description: string;
  duration: number;
  totalQuestions: number;
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
  latestScore?: number;
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
  curationStatus?: string;
  isSandboxPreview?: boolean;
}

export interface CategoryDetail {
  id: number;
  name: string;
  questionCount: number;
  duration: number;
  isCompleted?: boolean; // Track if subtest is completed
}
