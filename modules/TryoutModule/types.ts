export interface TryOutData {
  id: string;
  title: string;
  description?: string | null;
  number: string;
  participants: number;
  badge: string;
  solutionPrice: number;
  isPublic: boolean;
  isSpecial?: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  duration?: number;
  isRegistered?: boolean;
  curationStatus?: string;
  isSandboxPreview?: boolean;
}
