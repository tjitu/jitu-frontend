export interface TryoutFormData {
  title: string;
  description: string;
  solutionPrice: number | string;
  batch: string;
  releaseDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  isPublic: boolean;
  isSpecial: boolean;
  referralCode: string;
}
