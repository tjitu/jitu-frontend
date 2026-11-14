import { UNIVERSITIES, findUniversityByNameOrAcronym, getUniversityById } from "./universities-data";

export interface PtnChoice {
  uniId: string;
  university: string;
  acronym: string;
  jurusan: string;
  logo: string;
}

export interface PtnTargets {
  pilihan1: PtnChoice | null;
  pilihan2: PtnChoice | null;
  pilihan3: PtnChoice | null;
}

function resolveChoiceFromString(text?: string | null): PtnChoice | null {
  if (!text || typeof text !== "string") return null;
  const clean = text.trim();
  if (
    !clean ||
    clean === "Belum diatur" ||
    clean.toLowerCase() === "utbk 2026" ||
    clean.toLowerCase() === "snbt 2026" ||
    clean.toLowerCase() === "utbk" ||
    clean.toLowerCase() === "snbt"
  ) {
    return null;
  }

  // Handle format like "UI - Pendidikan Dokter" or "Universitas Indonesia - Kedokteran"
  let uniPart = "";
  let prodiPart = clean;

  if (clean.includes(" - ")) {
    const parts = clean.split(" - ");
    uniPart = parts[0].trim();
    prodiPart = parts.slice(1).join(" - ").trim();
  } else if (clean.includes(" · ")) {
    const parts = clean.split(" · ");
    uniPart = parts[0].trim();
    prodiPart = parts.slice(1).join(" · ").trim();
  } else if (clean.includes(" : ")) {
    const parts = clean.split(" : ");
    uniPart = parts[0].trim();
    prodiPart = parts.slice(1).join(" : ").trim();
  }

  const matchedUni = findUniversityByNameOrAcronym(uniPart || clean);
  if (matchedUni) {
    // If uniPart was empty, remove university name/acronym from prodiPart
    if (!uniPart) {
      prodiPart = prodiPart
        .replace(new RegExp(matchedUni.acronym, "gi"), "")
        .replace(new RegExp(matchedUni.name, "gi"), "")
        .replace(/^[\s·\-:]+|[\s·\-:]+$/g, "")
        .trim();
    }
    return {
      uniId: matchedUni.id,
      university: matchedUni.name,
      acronym: matchedUni.acronym,
      jurusan: prodiPart || matchedUni.programs[0] || "Belum dipilih",
      logo: matchedUni.logo,
    };
  }

  // Fallback to custom PTN if no match found
  return {
    uniId: "custom",
    university: uniPart || clean,
    acronym: uniPart ? uniPart.slice(0, 5).toUpperCase() : "PTN",
    jurusan: prodiPart || clean,
    logo: "",
  };
}

export function parsePtnTargets(rawTarget?: string | null): PtnTargets {
  const empty: PtnTargets = { pilihan1: null, pilihan2: null, pilihan3: null };
  if (!rawTarget || typeof rawTarget !== "string") return empty;

  const trimmed = rawTarget.trim();
  if (
    !trimmed ||
    trimmed === "Belum diatur" ||
    trimmed.toLowerCase() === "utbk 2026" ||
    trimmed.toLowerCase() === "snbt 2026"
  ) {
    return empty;
  }

  // 1. Try parsing JSON format
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const parseItem = (item: any): PtnChoice | null => {
        if (!item) return null;
        if (typeof item === "string") return resolveChoiceFromString(item);
        if (typeof item === "object") {
          const uniData =
            (item.uniId && getUniversityById(item.uniId)) ||
            findUniversityByNameOrAcronym(item.acronym || item.uni || item.university);

          return {
            uniId: item.uniId || uniData?.id || "custom",
            university: item.university || item.uni || uniData?.name || "PTN",
            acronym: item.acronym || item.acr || uniData?.acronym || "PTN",
            jurusan: item.jurusan || item.prodi || "",
            logo: uniData?.logo || item.logo || "",
          };
        }
        return null;
      };

      return {
        pilihan1: parseItem(parsed.p1 || parsed.pilihan1),
        pilihan2: parseItem(parsed.p2 || parsed.pilihan2),
        pilihan3: parseItem(parsed.p3 || parsed.pilihan3),
      };
    } catch {
      // not JSON
    }
  }

  // 2. Try parsing delimited string ("Pil 1: ... | Pil 2: ...")
  if (trimmed.includes(" | ")) {
    const parts = trimmed.split(" | ").map((p) =>
      p
        .replace(/^[1-3]\.\s*/, "")
        .replace(/^Pil\s*[1-3]:\s*/i, "")
        .trim()
    );
    return {
      pilihan1: resolveChoiceFromString(parts[0]),
      pilihan2: resolveChoiceFromString(parts[1]),
      pilihan3: resolveChoiceFromString(parts[2]),
    };
  }

  // 3. Fallback: single legacy target
  return {
    pilihan1: resolveChoiceFromString(trimmed),
    pilihan2: null,
    pilihan3: null,
  };
}

export function serializePtnTargets(targets: {
  pilihan1: PtnChoice | null;
  pilihan2: PtnChoice | null;
  pilihan3: PtnChoice | null;
}): string {
  const p1 = targets.pilihan1?.university ? targets.pilihan1 : null;
  const p2 = targets.pilihan2?.university ? targets.pilihan2 : null;
  const p3 = targets.pilihan3?.university ? targets.pilihan3 : null;

  if (!p1 && !p2 && !p3) {
    return "";
  }

  return JSON.stringify({
    p1: p1 ? { uniId: p1.uniId, university: p1.university, acronym: p1.acronym, jurusan: p1.jurusan || "", logo: p1.logo } : null,
    p2: p2 ? { uniId: p2.uniId, university: p2.university, acronym: p2.acronym, jurusan: p2.jurusan || "", logo: p2.logo } : null,
    p3: p3 ? { uniId: p3.uniId, university: p3.university, acronym: p3.acronym, jurusan: p3.jurusan || "", logo: p3.logo } : null,
  });
}

export function formatPtnTargetDisplay(rawTarget?: string | null): string {
  const targets = parsePtnTargets(rawTarget);
  const formatChoice = (p: PtnChoice | null, label: string) => {
    if (!p || (!p.university && !p.acronym)) return "";
    const uni = p.acronym || p.university;
    return p.jurusan ? `${label}: ${uni} - ${p.jurusan}` : `${label}: ${uni}`;
  };

  const active = [
    formatChoice(targets.pilihan1, "Pil 1"),
    formatChoice(targets.pilihan2, "Pil 2"),
    formatChoice(targets.pilihan3, "Pil 3"),
  ].filter(Boolean);

  if (active.length === 0) return "Belum diatur";
  return active.join(" · ");
}

export function getPtnTargetSummary(rawTarget?: string | null): string {
  const targets = parsePtnTargets(rawTarget);
  if (targets.pilihan1 && (targets.pilihan1.university || targets.pilihan1.acronym)) {
    const extra = [targets.pilihan2, targets.pilihan3].filter(
      (p) => p && (p.university || p.acronym)
    ).length;
    const uni = targets.pilihan1.acronym || targets.pilihan1.university;
    const label = targets.pilihan1.jurusan ? `${uni} - ${targets.pilihan1.jurusan}` : uni;
    return extra > 0 ? `${label} (+${extra} pilihan)` : label;
  }
  return "Belum diatur";
}
