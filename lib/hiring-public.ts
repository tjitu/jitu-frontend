import type { HiringApplication } from "./hiring-types";

export interface PublicTrackRecord {
  id: string;
  primaryRole: string;
  primaryDivision: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What anyone may learn when they look an application up by its id or email.
 * The caller already knows the id/email, so nothing identifying is echoed back.
 */
export function toPublicTrackRecord(
  app: Pick<HiringApplication, "id" | "primaryRole" | "primaryDivision" | "status" | "createdAt" | "updatedAt">
): PublicTrackRecord {
  return {
    id: app.id,
    primaryRole: app.primaryRole,
    primaryDivision: app.primaryDivision,
    status: app.status,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}
