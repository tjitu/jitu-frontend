export interface StatCard {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  suffix?: string;
}

export interface AdminTryoutStatsResponse {
  totalTryout: number;
  totalActiveTryout: number;
  totalUpcomingTryout: number;
  totalEndedTryout: number;
}

export interface AdminTryoutResponse {
  id: string;
  code: number;
  title: string;
  solutionPrice: number;
  releaseDate: Date;
  status: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
  isPublic: boolean;
  referralCode?: string | null;
  participantsCount?: number;
}
