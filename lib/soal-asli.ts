import { getDbPool } from "./db";
import fs from "fs";
import path from "path";

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

/**
 * Fetch all packages from PostgreSQL or fallback to JSON file
 */
export async function getSoalAsliPackages(filters?: {
  year?: number;
  subtest?: string;
  search?: string;
}): Promise<SoalAsliPackage[]> {
  try {
    const pool = getDbPool();
    const whereClauses: string[] = ["1=1"];
    const values: any[] = [];
    let pIdx = 1;

    if (filters?.year) {
      whereClauses.push(`year = $${pIdx++}`);
      values.push(filters.year);
    }
    if (filters?.subtest && filters.subtest !== "ALL") {
      whereClauses.push(`subtest = $${pIdx++}`);
      values.push(filters.subtest.toUpperCase());
    }
    if (filters?.search && filters.search.trim()) {
      whereClauses.push(`(title ILIKE $${pIdx} OR date_label ILIKE $${pIdx} OR subtest_name ILIKE $${pIdx})`);
      values.push(`%${filters.search.trim()}%`);
      pIdx++;
    }

    const query = `
      SELECT 
        id, slug, title, subtest, subtest_name as "subtestName",
        year, date_label as "dateLabel", duration_minutes as "durationMinutes",
        question_count as "questionCount", archive_label as "archiveLabel", source_url as "sourceUrl"
      FROM "soal_asli_packages"
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY year DESC, subtest ASC, id ASC;
    `;

    const { rows } = await pool.query(query, values);
    if (rows && rows.length > 0) {
      return rows;
    }
  } catch (err) {
    console.warn("DB query for soal_asli_packages failed, falling back to JSON:", err);
  }

  // Fallback to reading pintarly_soal_asli.json
  return loadPackagesFromJson(filters);
}

/**
 * Fetch a single package with its questions from PostgreSQL or fallback JSON
 */
export async function getSoalAsliPackageDetail(
  packageIdOrSlug: string
): Promise<SoalAsliPackageDetail | null> {
  try {
    const pool = getDbPool();
    // 1. Get package
    const pkgRes = await pool.query(
      `
      SELECT 
        id, slug, title, subtest, subtest_name as "subtestName",
        year, date_label as "dateLabel", duration_minutes as "durationMinutes",
        question_count as "questionCount", archive_label as "archiveLabel", source_url as "sourceUrl"
      FROM "soal_asli_packages"
      WHERE id = $1 OR slug = $1
      LIMIT 1;
    `,
      [packageIdOrSlug]
    );

    if (pkgRes.rows.length > 0) {
      const pkg = pkgRes.rows[0];

      // 2. Get questions with options
      const qRes = await pool.query(
        `
        SELECT 
          q.id,
          q.type,
          q.narration,
          q.content,
          COALESCE(q.points, 1) as points,
          q.subtest,
          COALESCE(json_agg(
            json_build_object(
              'id', opt.id,
              'content', opt.content,
              'order', opt."order"
            ) ORDER BY opt."order" ASC
          ) FILTER (WHERE opt.id IS NOT NULL), '[]'::json) as options
        FROM "Question" q
        LEFT JOIN "QuestionItem" opt ON opt.question_id = q.id
        WHERE q.package_id = $1
        GROUP BY q.id
        ORDER BY q.id ASC;
      `,
        [pkg.id]
      );

      const questions: SoalAsliQuestion[] = qRes.rows.map((row, index) => {
        const rawOpts = Array.isArray(row.options) ? row.options : [];
        const alphabet = ["A", "B", "C", "D", "E"];
        return {
          id: row.id,
          number: index + 1,
          type: row.type || (rawOpts.length >= 2 ? "PILIHAN_GANDA" : "ISIAN_SINGKAT"),
          narration: row.narration || null,
          content: row.content || "",
          points: Number(row.points) || 1,
          subtest: row.subtest || pkg.subtest,
          options: rawOpts.map((opt: any, oIdx: number) => ({
            id: opt.id,
            label: alphabet[opt.order ?? oIdx] || alphabet[oIdx] || `${oIdx + 1}`,
            content: opt.content,
            order: opt.order ?? oIdx,
          })),
        };
      });

      return {
        ...pkg,
        questions,
      };
    }
  } catch (err) {
    console.warn("DB query for package detail failed, falling back to JSON:", err);
  }

  // Fallback to JSON
  return loadPackageDetailFromJson(packageIdOrSlug);
}

/**
 * Group a list of packages into year sections
 */
export function groupPackagesByYear(packages: SoalAsliPackage[]): YearGroupedPackages[] {
  const map: Record<number, { totalQuestions: number; packages: SoalAsliPackage[] }> = {};

  for (const pkg of packages) {
    const y = pkg.year;
    if (!map[y]) {
      map[y] = { totalQuestions: 0, packages: [] };
    }
    map[y].packages.push(pkg);
    map[y].totalQuestions += pkg.questionCount;
  }

  const sortedYears = Object.keys(map)
    .map(Number)
    .sort((a, b) => b - a);

  return sortedYears.map((year) => ({
    year,
    totalQuestions: map[year].totalQuestions,
    packages: map[year].packages,
  }));
}

// ---------------------------------------------------------------------------
// Helpers to load from static JSON if needed
// ---------------------------------------------------------------------------

function getJsonFilePath(): string {
  return path.join(process.cwd(), "data", "pintarly_soal_asli.json");
}

function loadPackagesFromJson(filters?: {
  year?: number;
  subtest?: string;
  search?: string;
}): SoalAsliPackage[] {
  try {
    const filePath = getJsonFilePath();
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(raw.packages)) return [];

    let list: SoalAsliPackage[] = raw.packages.map((pkg: any, idx: number) => {
      const title = pkg.title || "";
      const label = pkg.archive_label || "";
      const url = pkg.url || "";
      const yearMatch = title.match(/20\d\d/) || label.match(/20\d\d/) || url.match(/20\d\d/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : 2024;

      let subtest = "PU";
      let subtestName = "Penalaran Umum";
      const combined = (title + " " + label + " " + url).toUpperCase();

      if (combined.includes("LBI") || combined.includes("LITERASI BAHASA INDONESIA")) {
        subtest = "LBI";
        subtestName = "Literasi Bahasa Indonesia";
      } else if (combined.includes("LBE") || combined.includes("LITERASI BAHASA INGGRIS")) {
        subtest = "LBE";
        subtestName = "Literasi Bahasa Inggris";
      } else if (combined.includes("PM") || combined.includes("PENALARAN MATEMATIKA")) {
        subtest = "PM";
        subtestName = "Penalaran Matematika";
      } else if (combined.includes("PK") || combined.includes("PENGETAHUAN KUANTITATIF")) {
        subtest = "PK";
        subtestName = "Pengetahuan Kuantitatif";
      } else if (combined.includes("PBM") || combined.includes("PEMAHAMAN BACAAN")) {
        subtest = "PBM";
        subtestName = "Pemahaman Bacaan dan Menulis";
      } else if (combined.includes("PPU") || combined.includes("PENGETAHUAN DAN PEMAHAMAN UMUM")) {
        subtest = "PPU";
        subtestName = "Pengetahuan dan Pemahaman Umum";
      }

      let dateLabel = label
        .replace(new RegExp(`^${subtest}\\s*`, "i"), "")
        .replace(new RegExp(`^${year}\\s*`, "i"), "")
        .replace(/\d+\s*soal.*$/i, "")
        .replace(/Lihat soal.*$/i, "")
        .trim();
      if (!dateLabel) dateLabel = `Paket UTBK ${subtest}`;

      let slug = "";
      if (url) {
        const parts = url.split("/").filter(Boolean);
        slug = parts[parts.length - 1];
      }
      if (!slug) slug = `soal-asli-${year}-${subtest.toLowerCase()}-${idx}`;

      return {
        id: `pkg-${slug}`,
        slug,
        title,
        subtest,
        subtestName,
        year,
        dateLabel,
        durationMinutes: 30,
        questionCount: pkg.questions ? pkg.questions.length : 0,
        archiveLabel: label,
        sourceUrl: url,
      };
    });

    if (filters?.year) {
      list = list.filter((p) => p.year === filters.year);
    }
    if (filters?.subtest && filters.subtest !== "ALL") {
      list = list.filter((p) => p.subtest.toUpperCase() === filters.subtest?.toUpperCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.dateLabel.toLowerCase().includes(q) ||
          p.subtestName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.year - a.year);
  } catch (err) {
    console.error("Error reading fallback JSON:", err);
    return [];
  }
}

function loadPackageDetailFromJson(packageIdOrSlug: string): SoalAsliPackageDetail | null {
  try {
    const filePath = getJsonFilePath();
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(raw.packages)) return null;

    const allPkgs = loadPackagesFromJson();
    const pkg = allPkgs.find((p) => p.id === packageIdOrSlug || p.slug === packageIdOrSlug);
    if (!pkg) return null;

    const rawPkg = raw.packages.find((p: any) => {
      const url = p.url || "";
      return url.includes(pkg.slug) || p.title === pkg.title;
    });

    if (!rawPkg) return null;

    const questions: SoalAsliQuestion[] = (rawPkg.questions || []).map(
      (q: any, idx: number) => {
        const rawText = q.text || "";
        const nomorMatch = rawText.match(/(?:^|\n)(Nomor\s+\d+)\s*\n/);
        let narration: string | null = null;
        let bodyAfterNomor = rawText;
        if (nomorMatch) {
          const splitIndex = nomorMatch.index;
          const passagePart = rawText.substring(0, splitIndex).trim();
          if (passagePart.length > 0) narration = passagePart;
          bodyAfterNomor = rawText.substring(splitIndex + nomorMatch[0].length).trim();
        }

        const optionRegex = /(?:^|\n)\s*([A-E])\.\s*/g;
        const matches = [...bodyAfterNomor.matchAll(optionRegex)];
        let content = "";
        const options: SoalAsliQuestionOption[] = [];

        if (matches.length >= 2) {
          content = bodyAfterNomor.substring(0, matches[0].index).trim();
          for (let i = 0; i < matches.length; i++) {
            const label = matches[i][1];
            const start = matches[i].index + matches[i][0].length;
            const end = i + 1 < matches.length ? matches[i + 1].index : bodyAfterNomor.length;
            options.push({
              id: `${pkg.id}-q${q.number}-opt-${label}`,
              label,
              content: bodyAfterNomor.substring(start, end).trim(),
              order: i,
            });
          }
        } else {
          content = bodyAfterNomor.trim();
        }

        return {
          id: `${pkg.id}-q${q.number}`,
          number: q.number || idx + 1,
          type: options.length >= 2 ? "PILIHAN_GANDA" : "ISIAN_SINGKAT",
          narration,
          content,
          points: 1,
          subtest: pkg.subtest,
          options,
        };
      }
    );

    return {
      ...pkg,
      questions,
    };
  } catch (err) {
    console.error("Error reading package detail fallback JSON:", err);
    return null;
  }
}
