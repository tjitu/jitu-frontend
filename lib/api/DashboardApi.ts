import { BACKEND_URL } from "../api";

export interface UserStats {
  tokenBalance: number;
  lastScore: number;
  personalBest: number;
  weeklyActivity: number;
  totalFinished: number;
  currentStreak: number;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
}

export interface OngoingTryout {
  id: string;
  title: string;
  description: string | null;
  solutionPrice: number;
  isPublic: boolean;
  scheduledStart: Date | null;
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
  scheduledStart: Date | null;
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
