export type AdminAccess =
  | { ok: true }
  | { ok: false; status: 401 | 403; message: string };

/**
 * Decides whether an already-authenticated user may use admin-only endpoints.
 * `user` must come from a verified session (see getAuthenticatedAppUser), never from
 * request parameters such as `?admin=true`.
 */
export function evaluateAdminAccess(
  user: { role?: string | null } | null | undefined
): AdminAccess {
  if (!user) {
    return { ok: false, status: 401, message: "Autentikasi diperlukan." };
  }
  if (String(user.role ?? "").toUpperCase() !== "ADMIN") {
    return { ok: false, status: 403, message: "Akses admin diperlukan." };
  }
  return { ok: true };
}
