import { BACKEND_URL } from "@/lib/api";
import { TryoutDetail } from "@/modules/TryoutDetailModule/interface";

const SANDBOX_TOKEN_STORAGE_KEY = "jitu_tryout_sandbox_token";

/** Reads and persists any active Tryout QC Sandbox preview token across tabs/steps. */
export function getActiveTryoutSandboxToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("token") || params.get("sandboxToken") || "";
    if (/^[a-f0-9]{64}$/i.test(fromUrl.trim())) {
      window.sessionStorage.setItem(SANDBOX_TOKEN_STORAGE_KEY, fromUrl.trim());
      params.delete("token");
      params.delete("sandboxToken");
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
      return fromUrl.trim();
    }
    return window.sessionStorage.getItem(SANDBOX_TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export type LeaderboardItem = {
  rank: number;
  name: string;
  score: number;
  isCurrentUser: boolean;
};

export type LeaderboardData = {
  top10: LeaderboardItem[];
  currentUserRank: LeaderboardItem | null;
};

const extractTryoutApiError = async (
  res: Response,
  fallback: string,
): Promise<string> => {
  const raw = (await res.text().catch(() => "")).trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { message?: string | string[] };
      if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        return parsed.message.join(", ");
      }
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message.trim();
      }
    } catch {
      // Plain text error body (e.g. Next.js rewrite proxy Internal Server Error)
    }
    if (res.status >= 500 && raw === "Internal Server Error") {
      return "Server backend sedang memulai ulang atau tidak merespons (500). Pastikan backend port 3000 aktif lalu refresh halaman.";
    }
    return raw;
  }
  return fallback;
};

export const getTryoutDetail = async (
  tryoutId: string,
): Promise<TryoutDetail> => {
  const sandboxToken = getActiveTryoutSandboxToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;
  const res = await fetch(`${BACKEND_URL}/tryout/${tryoutId}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      await extractTryoutApiError(res, "Gagal mengambil data try out"),
    );
  }

  const data = await res.json();

  const mappedData: TryoutDetail = {
    id: data.id,
    title: data.title,
    description: data.description || "Tidak ada deskripsi",
    badge: data.badge || "UTBK",
    number: data.number || "1",

    isFree: data.isFree,
    isSpecial: Boolean(data.isSpecial),
    tokenCost: data.tokenCost,

    participants: data.participants ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    duration: data.duration ?? 0,
    startDate: data.startDate,
    endDate: data.endDate,

    isRegistered: !!data.isRegistered,
    unlockedSolutions: data.unlockedSolutions || [],

    benefits: data.benefits || [],
    requirements: data.requirements || [],

    categories: data.categories || [],

    latestFinishedAttemptId: data.latestFinishedAttemptId ?? null,
    latestAttemptStatus: data.latestAttemptStatus ?? null,
    latestAttemptId: data.latestAttemptId ?? null,
    currentSubtestOrder: data.currentSubtestOrder ?? 1,
    latestScore: data.latestScore ?? 0,
    correctCount: data.correctCount ?? 0,
    wrongCount: data.wrongCount ?? 0,
    emptyCount: data.emptyCount ?? 0,
    curationStatus: data.curationStatus,
    isSandboxPreview: Boolean(data.isSandboxPreview),
  };

  return mappedData;
};

export const getTryoutLeaderboard = async (
  tryoutId: string,
): Promise<LeaderboardData | null> => {
  try {
    const sandboxToken = getActiveTryoutSandboxToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;

    const res = await fetch(`${BACKEND_URL}/tryout/${tryoutId}/leaderboard`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 404) {
        // Leaderboard not available yet
        return null;
      }
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
};
