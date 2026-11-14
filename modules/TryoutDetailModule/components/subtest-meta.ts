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
  IconComponent: React.ComponentType<{ className?: string; size?: number }>;
}

export const SUBTEST_DIRECTORY: Record<string, SubtestMeta> = {
  PU: {
    code: "PU",
    name: "Penalaran Umum",
    IconComponent: IconPU,
  },
  PPU: {
    code: "PPU",
    name: "Pengetahuan & Pemahaman Umum",
    IconComponent: IconPPU,
  },
  PBM: {
    code: "PBM",
    name: "Pemahaman Bacaan & Menulis",
    IconComponent: IconPBM,
  },
  PK: {
    code: "PK",
    name: "Pengetahuan Kuantitatif",
    IconComponent: IconPK,
  },
  LBI: {
    code: "LBI",
    name: "Literasi Bahasa Indonesia",
    IconComponent: IconLBI,
  },
  LBE: {
    code: "LBE",
    name: "Literasi Bahasa Inggris",
    IconComponent: IconLBE,
  },
  PM: {
    code: "PM",
    name: "Penalaran Matematika",
    IconComponent: IconPM,
  },
};

/**
 * Resolves raw subtest name into clean metadata
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

  const orderKeys = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"];
  const fallbackKey = orderKeys[index % orderKeys.length] || "PU";
  return SUBTEST_DIRECTORY[fallbackKey];
}
