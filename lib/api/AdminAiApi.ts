import { BACKEND_URL } from "../api";

export type AiDifficulty = "EASY" | "MEDIUM" | "HARD";
export type AiBatchStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "PUBLISHED";
export type AiDraftStatus =
  | "DRAFT"
  | "APPROVED"
  | "REJECTED"
  | "REGENERATING"
  | "PUBLISHED";
export type AiQuestionType =
  | "PILIHAN_GANDA"
  | "ISIAN_SINGKAT"
  | "BENAR_SALAH";
export type AiVideoStrategy = "SLIDES_TTS" | "AI_VIDEO";

export interface AiStatus {
  status: string;
  provider?: string;
  isMock?: boolean;
  mockAssetMode?: string | null;
  database?: string;
}

export interface CreateAiBatchPayload {
  title?: string;
  tryoutId: string;
  tryoutTitle?: string;
  subtestId?: string;
  subtestName?: string;
  subject?: string;
  topic?: string;
  difficulty: AiDifficulty;
  totalQuestions?: number;
  questionTypes: AiQuestionType[];
  includeImages: boolean;
  includeVideos: boolean;
  videoStrategy?: AiVideoStrategy;
}

export interface AiBatch {
  id: string;
  title: string;
  tryoutId: string;
  tryoutTitle?: string | null;
  subtestId: string;
  subtestName: string;
  subject: string;
  topic: string;
  difficulty: AiDifficulty;
  totalQuestions: number;
  requestedCount: number;
  completedCount: number;
  failedCount: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  includeImages: boolean;
  includeVideos: boolean;
  videoStrategy?: AiVideoStrategy | null;
  status: AiBatchStatus;
  provider: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface AiDraftOption {
  label: string;
  content: string;
  isCorrect: boolean;
  order: number;
}

export interface AiAsset {
  id: string;
  kind: "IMAGE" | "VIDEO";
  provider: string;
  status: "PENDING" | "UPLOADED" | "FAILED";
  secureUrl?: string | null;
  sourceUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface AiDraft {
  id: string;
  batchId: string;
  order: number;
  status: AiDraftStatus;
  subtestId?: string | null;
  subtestName?: string | null;
  type: AiQuestionType;
  subject: string;
  topic: string;
  difficulty: AiDifficulty;
  content: string;
  explanation: string;
  correctAnswer?: string | null;
  options: AiDraftOption[];
  points: number;
  imagePrompt?: string | null;
  videoPrompt?: string | null;
  imageAssetId?: string | null;
  videoAssetId?: string | null;
  qcNotes?: string | null;
  revision: number;
  assets?: AiAsset[];
}

export interface AiUsageSummary {
  batchId: string;
  totals: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

export interface UpdateAiDraftPayload {
  content?: string;
  explanation?: string;
  correctAnswer?: string;
  options?: AiDraftOption[];
  points?: number;
  qcNotes?: string;
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "AI Generator request failed");
  }

  return payload as T;
};

export const getAiStatus = () => request<AiStatus>("/admin/ai/status");

export const createAiBatch = (payload: CreateAiBatchPayload) =>
  request<AiBatch>("/admin/ai/batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAiBatches = () => request<AiBatch[]>("/admin/ai/batches");

export const getAiBatch = (id: string) =>
  request<AiBatch>(`/admin/ai/batches/${id}`);

export const startAiBatch = (id: string) =>
  request<AiBatch>(`/admin/ai/batches/${id}/start`, { method: "POST" });

export const cancelAiBatch = (id: string) =>
  request<AiBatch>(`/admin/ai/batches/${id}/cancel`, { method: "POST" });

export const getAiBatchDrafts = (id: string) =>
  request<AiDraft[]>(`/admin/ai/batches/${id}/drafts`);

export const updateAiDraft = (id: string, payload: UpdateAiDraftPayload) =>
  request<AiDraft>(`/admin/ai/drafts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const approveAiDraft = (id: string) =>
  request<AiDraft>(`/admin/ai/drafts/${id}/approve`, { method: "POST" });

export const rejectAiDraft = (id: string, reason?: string) =>
  request<AiDraft>(`/admin/ai/drafts/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const regenerateAiDraft = (id: string, instructions?: string) =>
  request<AiDraft>(`/admin/ai/drafts/${id}/regenerate`, {
    method: "POST",
    body: JSON.stringify({ instructions }),
  });

export const generateAiDraftImage = (id: string, prompt?: string) =>
  request<AiDraft>(`/admin/ai/drafts/${id}/assets/image`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

export const generateAiDraftVideo = (id: string, prompt?: string) =>
  request<AiDraft>(`/admin/ai/drafts/${id}/assets/video`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

export const getAiBatchUsage = (batchId: string) =>
  request<AiUsageSummary>(`/admin/ai/usage/batches/${batchId}`);

export const publishAiBatch = (batchId: string) =>
  request<{ importedQuestions: number; publishedCount: number }>(
    `/admin/ai/publish/batches/${batchId}`,
    { method: "POST" }
  );
