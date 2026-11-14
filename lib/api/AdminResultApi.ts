import { BACKEND_URL } from "../api";

export interface LeaderboardEntry {
  rank: number;
  totalScore: number;
  user: {
    name: string;
    email: string;
    image?: string;
    target?: string;
  };
}

export interface TryoutStats {
  title: string;
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  distribution: {
    under400: number;
    range400to600: number;
    range600to800: number;
    above800: number;
  };
}

export const getLeaderboard = async (tryoutId: string, page = 1, limit = 50) => {
  const response = await fetch(
    `${BACKEND_URL}/admin/tryouts/${tryoutId}/leaderboard?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return response.json();
};

export const getTryoutStats = async (tryoutId: string): Promise<TryoutStats> => {
  const response = await fetch(`${BACKEND_URL}/admin/tryouts/${tryoutId}/stats`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tryout stats");
  }
  return response.json();
};

export interface RegistrantEntry {
  id: string; // attemptId
  userId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
  totalScore: number;
  startedAt: string;
  finishedAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    target?: string | null;
  };
}

export interface RegistrantsResponse {
  data: RegistrantEntry[];
  counts: {
    all: number;
    notStarted: number;
    inProgress: number;
    finished: number;
  };
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const getRegistrants = async (
  tryoutId: string,
  page = 1,
  limit = 20,
  status: "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" = "ALL",
  search = ""
): Promise<RegistrantsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status && status !== "ALL") params.append("status", status);
  if (search.trim()) params.append("search", search.trim());

  const response = await fetch(
    `${BACKEND_URL}/admin/tryouts/${tryoutId}/registrants?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch registrants");
  }
  return response.json();
};

export const exportResults = async (tryoutId: string, type: "all" | "finished" = "all") => {
  const response = await fetch(
    `${BACKEND_URL}/admin/tryouts/${tryoutId}/export?type=${type}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to export results");
  }
  return response.json();
};
