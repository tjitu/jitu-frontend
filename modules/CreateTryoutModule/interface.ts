export interface TryoutFormData {
  title: string;
  description: string;
  solutionPrice: number | string;
  batch: string;
  scheduledStart: string;
  scheduledEnd: string;
  isPublic: boolean;
  isSpecial: boolean;
  referralCode: string;
}
