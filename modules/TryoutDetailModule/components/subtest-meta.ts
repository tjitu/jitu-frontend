import React from "react";
import {
  IconPU,
  IconPPU,
  IconPBM,
  IconPK,
  IconLBI,
  IconLBE,
  IconPM,
} from "./SubtestIcons";

export interface SubtestMeta {
  code: string;
  name: string;
  tagline: string;
  color: string;
  bgGradient: string;
  softBg: string;
  border: string;
  borderHover: string;
  IconComponent: React.ComponentType<{ className?: string; size?: number }>;
}

export const SUBTEST_DIRECTORY: Record<string, SubtestMeta> = {
  PU: {
    code: "PU",
    name: "Penalaran Umum",
    tagline: "Logika deduktif, induktif, & pola analitis",
    color: "text-blue-600",
    bgGradient: "from-blue-600 to-indigo-700",
    softBg: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    borderHover: "hover:border-blue-400",
    IconComponent: IconPU,
  },
  PPU: {
    code: "PPU",
    name: "Pengetahuan & Pemahaman Umum",
    tagline: "Wawasan kontekstual, sinonim, & makna teks",
    color: "text-emerald-600",
    bgGradient: "from-emerald-600 to-teal-700",
    softBg: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    borderHover: "hover:border-emerald-400",
    IconComponent: IconPPU,
  },
  PBM: {
    code: "PBM",
    name: "Pemahaman Bacaan & Menulis",
    tagline: "Struktur kalimat, ejaan PUEBI, & koherensi paragraf",
    color: "text-amber-600",
    bgGradient: "from-amber-500 to-orange-600",
    softBg: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
    borderHover: "hover:border-amber-400",
    IconComponent: IconPBM,
  },
  PK: {
    code: "PK",
    name: "Pengetahuan Kuantitatif",
    tagline: "Aritmetika, aljabar, kalkulasi, & probabilitas",
    color: "text-purple-600",
    bgGradient: "from-purple-600 to-violet-700",
    softBg: "bg-purple-50 text-purple-700",
    border: "border-purple-200",
    borderHover: "hover:border-purple-400",
    IconComponent: IconPK,
  },
  LBI: {
    code: "LBI",
    name: "Literasi Bahasa Indonesia",
    tagline: "Analisis kritis teks naratif & eksplanatif nasional",
    color: "text-rose-600",
    bgGradient: "from-rose-500 to-red-600",
    softBg: "bg-rose-50 text-rose-700",
    border: "border-rose-200",
    borderHover: "hover:border-rose-400",
    IconComponent: IconLBI,
  },
  LBE: {
    code: "LBE",
    name: "Literasi Bahasa Inggris",
    tagline: "Reading comprehension, inference, & global vocabulary",
    color: "text-indigo-600",
    bgGradient: "from-indigo-600 to-sky-600",
    softBg: "bg-indigo-50 text-indigo-700",
    border: "border-indigo-200",
    borderHover: "hover:border-indigo-400",
    IconComponent: IconLBE,
  },
  PM: {
    code: "PM",
    name: "Penalaran Matematika",
    tagline: "Pemodelan matematis kasus nyata & geometri",
    color: "text-teal-600",
    bgGradient: "from-teal-600 to-cyan-700",
    softBg: "bg-teal-50 text-teal-700",
    border: "border-teal-200",
    borderHover: "hover:border-teal-400",
    IconComponent: IconPM,
  },
};

/**
 * Resolves any raw subtest string (e.g. "PU", "Penalaran Umum", "LITINDO", "01 PU") into standard metadata
 */
export function getSubtestInfo(rawName: string, index = 0): SubtestMeta {
  const normalized = (rawName || "").trim().toUpperCase();

  if (normalized.includes("PU") && !normalized.includes("PPU")) {
    return SUBTEST_DIRECTORY.PU;
  }
  if (normalized.includes("PPU") || normalized.includes("PEMAHAMAN UMUM")) {
    return SUBTEST_DIRECTORY.PPU;
  }
  if (
    normalized.includes("PBM") ||
    normalized.includes("MEMAHAMI BACAAN") ||
    normalized.includes("BACAAN DAN MENULIS")
  ) {
    return SUBTEST_DIRECTORY.PBM;
  }
  if (normalized.includes("PK") || normalized.includes("KUANTITATIF")) {
    return SUBTEST_DIRECTORY.PK;
  }
  if (
    normalized.includes("LBI") ||
    normalized.includes("INDONESIA") ||
    normalized.includes("LITINDO")
  ) {
    return SUBTEST_DIRECTORY.LBI;
  }
  if (
    normalized.includes("LBE") ||
    normalized.includes("INGGRIS") ||
    normalized.includes("ENGLISH") ||
    normalized.includes("LITING")
  ) {
    return SUBTEST_DIRECTORY.LBE;
  }
  if (normalized.includes("PM") || normalized.includes("MATEMATIKA")) {
    return SUBTEST_DIRECTORY.PM;
  }

  // Fallback by standard order
  const orderKeys = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"];
  const fallbackKey = orderKeys[index % orderKeys.length] || "PU";
  return SUBTEST_DIRECTORY[fallbackKey];
}
