import { BACKEND_URL } from "../api";

export interface UserStats {
  tokenBalance: number;
  lastScore: number;
  personalBest: number;
  weeklyActivity: number;
  totalFinished: number;
  currentStreak: number;
  solvedQuestions?: number;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
}

export interface OngoingTryout {
  id: string;
  title: string;
  description: string | null;
  solutionPrice: number;
  isPublic: boolean;
  isSpecial?: boolean;
  scheduledStart: Date | string | null;
  scheduledEnd?: Date | string | null;
  createdAt: Date;
  participants: number;
  isRegistered: boolean;
  status?: string; // IN_PROGRESS, FINISHED, NOT_STARTED
  score?: number;
}

export interface AvailableTryout {
  id: string;
  title: string;
  description: string | null;
  solutionPrice: number;
  isPublic: boolean;
  isSpecial?: boolean;
  scheduledStart: Date | string | null;
  scheduledEnd?: Date | string | null;
  createdAt: Date;
  participants: number;
}

export interface ScoreHistory {
  to: string;
  total: number;
  pu: number;
  ppu: number;
  pbm: number;
  pk: number;
  lbi: number;
  lbe: number;
  pm: number;
}

export interface DailyQuestionStatus {
  isCompleted: boolean;
  streak: number;
  question?: {
    id: string;
    content: string;
  } | null;
}

export interface DashboardArticleSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string;
  readTimeMinutes: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface DashboardSnapshot {
  stats: UserStats;
  ongoing: OngoingTryout[];
  available: AvailableTryout[];
  history: ScoreHistory[];
  dailyStatus?: DailyQuestionStatus | null;
  articles?: DashboardArticleSummary[];
  fetchedAt: number;
}

const DASHBOARD_STALE_MS = 30_000;
let dashboardSnapshot: DashboardSnapshot | null = null;

export const getCachedDashboardData = (): DashboardSnapshot | null => dashboardSnapshot;

export const isDashboardCacheFresh = (): boolean =>
  Boolean(dashboardSnapshot && Date.now() - dashboardSnapshot.fetchedAt < DASHBOARD_STALE_MS);

export const setCachedDashboardData = (data: Omit<DashboardSnapshot, "fetchedAt">) => {
  dashboardSnapshot = { ...data, fetchedAt: Date.now() };
};

export const invalidateDashboardCache = () => {
  dashboardSnapshot = null;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await fetch(`${BACKEND_URL}/dashboard/stats`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return {
        tokenBalance: 0,
        lastScore: 0,
        personalBest: 0,
        weeklyActivity: 0,
        totalFinished: 0,
        currentStreak: 0,
      };
    }
    throw new Error("Failed to fetch user stats");
  }

  return response.json();
};

export const getOngoingTryouts = async (): Promise<OngoingTryout[]> => {
  const response = await fetch(`${BACKEND_URL}/dashboard/tryouts/ongoing`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch ongoing tryouts");
  }

  return response.json();
};

export const getAvailableTryouts = async (): Promise<AvailableTryout[]> => {
  const response = await fetch(`${BACKEND_URL}/dashboard/tryouts/available`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch available tryouts");
  }

  return response.json();
};

export const getScoreHistory = async (): Promise<ScoreHistory[]> => {
  const response = await fetch(`${BACKEND_URL}/dashboard/score-history`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // Temporary fallback until backend implements this endpoint
    if (response.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch score history");
  }

  return response.json();
};

export const getDailyQuestionStatus = async (): Promise<DailyQuestionStatus | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/dashboard/daily-question`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

export const getLatestDashboardArticles = async (
  limit = 3
): Promise<DashboardArticleSummary[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/articles`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, limit) : [];
  } catch {
    return [];
  }
};
