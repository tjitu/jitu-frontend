import { BACKEND_URL } from "@/lib/api";
import { getActiveTryoutSandboxToken } from "@/lib/api/tryout";

export class TryoutStartError extends Error {
  constructor(message: string, public readonly code?: string) { super(message); }
}

export const startTryoutAttempt = async (
  tryoutId: string,
  userId: string,
): Promise<string> => {
  const sandboxToken = getActiveTryoutSandboxToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;
  const res = await fetch(`${BACKEND_URL}/exam/${tryoutId}/start`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const payload: { message?: string | string[]; code?: string } | null = await res.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new TryoutStartError(message || "Gagal memulai tryout.", payload?.code);
  }

  const data = await res.json();
  const id = data?.attemptId || data?.id;

  if (!id) {
    throw new Error(
      "Attempt berhasil dibuat, tapi attemptId tidak ditemukan di response.",
    );
  }

  return String(id);
};

export const registerTryout = async (
  tryoutId: string,
  mode: "FREE" | "PREMIUM" = "FREE",
  expectedSolutionPrice?: number,
) => {
  const sandboxToken = getActiveTryoutSandboxToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;
  const res = await fetch(`${BACKEND_URL}/tryout/${tryoutId}/register`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ mode, expectedSolutionPrice }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mendaftar tryout");
  }

  return data;
};

export async function startNextSubtest(attemptId: string, subtestOrder: number) {
  const response = await fetch(`${BACKEND_URL}/exam/${encodeURIComponent(attemptId)}/start-subtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ subtestOrder }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(typeof error?.message === "string" ? error.message : "Subtes gagal dimulai. Coba lagi.");
  }
}
