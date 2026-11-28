export type VerificationStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
export type SocialItem = 'follow' | 'likeTag' | 'story';
export interface GrowthConfig {
  enabled: boolean; manualVerification: boolean; profileUrl: string; campaignUrl: string;
  items: Record<SocialItem, { enabled: boolean; required: boolean }>;
  mentionRequired: boolean;
  prize: { enabled: boolean; winners: number; type: string; info: string };
  community: { enabled: boolean; url: string };
}
export interface GrowthSubmission {
  instagramUsername: string; checklist: Record<SocialItem, boolean>; requestKey: string;
  sessionId: string; configVersion: number; version?: number;
}
export interface GrowthState {
  solutionPrice?: number;
  tryoutId: string; tryoutName: string; config: GrowthConfig; configVersion: number;
  isRegistered: boolean; exempt: boolean; registrationClosed: boolean;
  verification: null | {
    id: string; status: VerificationStatus; version: number; instagramUsername: string | null;
    submittedChecklist: Partial<Record<SocialItem, boolean>>;
    submittedAt: string; verifiedAt: string | null; approvalMethod: string | null;
    rejectionReasons: string[];
    history: Array<{ action: string; createdAt: string; status: VerificationStatus; rejectionReasons: string[] }>;
  };
}
export const normalizeInstagram = (value: string) => value.trim().replace(/^@/, '').toLowerCase();
export const validInstagram = (value: string) => {
  const name = normalizeInstagram(value);
  return name.length >= 1 && name.length <= 30 && /^[a-z0-9_][a-z0-9._]*$/.test(name) && !name.endsWith('.') && !name.includes('..');
};
