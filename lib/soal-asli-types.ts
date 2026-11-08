export interface SoalAsliPackage {
  id: string;
  slug: string;
  title: string;
  subtest: string; // 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'
  subtestName: string;
  year: number;
  dateLabel: string;
  durationMinutes: number;
  questionCount: number;
  archiveLabel?: string;
  sourceUrl?: string;
}

export interface SoalAsliQuestionOption {
  id: string;
  label: string;
  content: string;
  order: number;
}

export interface SoalAsliQuestion {
  id: string;
  number: number;
  type: "PILIHAN_GANDA" | "ISIAN_SINGKAT";
  narration?: string | null;
  content: string;
  options: SoalAsliQuestionOption[];
  points: number;
  subtest: string;
}

export interface SoalAsliPackageDetail extends SoalAsliPackage {
  questions: SoalAsliQuestion[];
}

export interface YearGroupedPackages {
  year: number;
  totalQuestions: number;
  packages: SoalAsliPackage[];
}

// Subtest badge styling helper
export const SUBTEST_META: Record<
  string,
  { label: string; code: string; color: string; badgeBg: string; border: string }
> = {
  PU: {
    label: "Penalaran Umum",
    code: "PU",
    color: "text-blue-700",
    badgeBg: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
  },
  PPU: {
    label: "Pengetahuan & Pemahaman Umum",
    code: "PPU",
    color: "text-emerald-700",
    badgeBg: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
  },
  PBM: {
    label: "Pemahaman Bacaan & Menulis",
    code: "PBM",
    color: "text-amber-700",
    badgeBg: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
  },
  PK: {
    label: "Pengetahuan Kuantitatif",
    code: "PK",
    color: "text-purple-700",
    badgeBg: "bg-purple-50 text-purple-700",
    border: "border-purple-200",
  },
  LBI: {
    label: "Literasi Bahasa Indonesia",
    code: "LBI",
    color: "text-red-700",
    badgeBg: "bg-red-50 text-red-700",
    border: "border-red-200",
  },
  LBE: {
    label: "Literasi Bahasa Inggris",
    code: "LBE",
    color: "text-indigo-700",
    badgeBg: "bg-indigo-50 text-indigo-700",
    border: "border-indigo-200",
  },
  PM: {
    label: "Penalaran Matematika",
    code: "PM",
    color: "text-teal-700",
    badgeBg: "bg-teal-50 text-teal-700",
    border: "border-teal-200",
  },
};
