import { BACKEND_URL } from "../api";

export const getTryoutStats = async () => {
  const response = await fetch(`${BACKEND_URL}/admin/stats`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tryout stats");
  }
  return response.json();
};

export const getAllTryouts = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/admin/tryouts?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tryouts");
  }
  return response.json();
};

export interface CreateTryoutPayload {
  title: string;
  description?: string;
  solutionPrice: number;
  batch: string;
  releaseDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  isPublic?: boolean;
  isSpecial?: boolean;
  referralCode?: string;
}

export const createTryout = async (data: CreateTryoutPayload) => {
  const response = await fetch(`${BACKEND_URL}/admin/tryouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create tryout");
  }
  return response.json();
};

export interface Subtest {
  id: string;
  tryOutId: string;
  name: string; // Enum SubtestName
  durationMinutes: number;
  order: number;
}

export const createUtbkSubtests = async (tryoutId: string) => {
  const response = await fetch(`${BACKEND_URL}/admin/subtests/${tryoutId}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create subtests");
  }
  return response.json(); // Returns Created count or similar
};

export const updateSubtest = async (
  id: string,
  data: { durationMinutes: number }
) => {
  const response = await fetch(`${BACKEND_URL}/admin/subtests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update subtest");
  }
  return response.json();
};

export const getSubtestsByTryout = async (
  tryoutId: string
): Promise<Subtest[]> => {
  const response = await fetch(
    `${BACKEND_URL}/admin/tryouts/${tryoutId}/subtests`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subtests");
  }
  return response.json();
};

export const getTryoutById = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/admin/tryouts/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tryout");
  }
  return response.json();
};

export const getTryoutPreview = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/admin/tryouts/${id}/preview`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tryout preview");
  }
  return response.json();
};

export type UpdateTryoutPayload = Partial<CreateTryoutPayload>;

export const updateTryout = async (id: string, data: UpdateTryoutPayload) => {
  const response = await fetch(`${BACKEND_URL}/admin/tryouts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update tryout");
  }
  return response.json();
};
