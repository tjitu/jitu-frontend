import { BACKEND_URL } from "@/lib/api";
import { getActiveTryoutSandboxToken } from "@/lib/api/tryout";

export const startTryoutAttempt = async (
  tryoutId: string,
  userId: string,
): Promise<string> => {
  const sandboxToken = getActiveTryoutSandboxToken();
  const qs = sandboxToken
    ? `?sandboxToken=${encodeURIComponent(sandboxToken)}`
    : "";
  const res = await fetch(`${BACKEND_URL}/exam/${tryoutId}/start${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Gagal memulai attempt");
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

export const registerTryout = async (tryoutId: string) => {
  const sandboxToken = getActiveTryoutSandboxToken();
  const qs = sandboxToken
    ? `?sandboxToken=${encodeURIComponent(sandboxToken)}`
    : "";
  const res = await fetch(`${BACKEND_URL}/tryout/${tryoutId}/register${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mendaftar tryout");
  }

  return data;
};
