const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5173";

export const BACKEND_URL = `${typeof window !== "undefined" ? window.location.origin : BASE_URL}/api/proxy`;

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
