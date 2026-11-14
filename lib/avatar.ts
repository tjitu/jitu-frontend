/**
 * JITU Student Avatar System
 * Generates fun, friendly illustrated avatars (DiceBear 9.x) for students
 * and provides preset avatars for avatar selection.
 */

export type AvatarStyle = "adventurer" | "open-peeps" | "lorelei";

export const PASTEL_PALETTE = [
  "b6e3f4",
  "c0aede",
  "d1d4f9",
  "ffd5dc",
  "ffdfbf",
  "d5f4e6",
  "fed7aa",
];

export interface PresetAvatar {
  id: string;
  name: string;
  tag: string;
  url: string;
}

/**
 * Builds a DiceBear avatar URL for a given seed, style, and optional background color.
 */
export function buildDiceBearUrl(
  seed: string,
  style: AvatarStyle = "adventurer",
  bgColor?: string
): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase());
  const bgParam = bgColor || PASTEL_PALETTE.join(",");
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&backgroundColor=${bgParam}`;
}

/**
 * Curated preset avatars reflecting different student personalities preparing for UTBK/SNBT.
 */
export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "pejuang-snbt",
    name: "Pejuang SNBT",
    tag: "Fokus & Ambisius",
    url: buildDiceBearUrl("pejuang-snbt", "adventurer", "b6e3f4"),
  },
  {
    id: "bintang-kampus",
    name: "Bintang Kampus",
    tag: "Ceria & Aktif",
    url: buildDiceBearUrl("bintang-kampus", "adventurer", "ffd5dc"),
  },
  {
    id: "fokus-utbk",
    name: "Fokus UTBK",
    tag: "Disiplin Tinggi",
    url: buildDiceBearUrl("fokus-utbk", "adventurer", "c0aede"),
  },
  {
    id: "cita-dokter",
    name: "Cita-cita Dokter",
    tag: "Sains & Analisis",
    url: buildDiceBearUrl("cita-dokter", "adventurer", "d5f4e6"),
  },
  {
    id: "juara-mtk",
    name: "Juara Matematika",
    tag: "Logika Tajam",
    url: buildDiceBearUrl("juara-mtk", "adventurer", "ffdfbf"),
  },
  {
    id: "peneliti-muda",
    name: "Peneliti Muda",
    tag: "Rasa Ingin Tahu",
    url: buildDiceBearUrl("peneliti-muda", "adventurer", "fed7aa"),
  },
  {
    id: "ahli-literasi",
    name: "Ahli Literasi",
    tag: "Kreatif & Kritis",
    url: buildDiceBearUrl("ahli-literasi", "open-peeps", "b6e3f4"),
  },
  {
    id: "calon-insinyur",
    name: "Calon Insinyur",
    tag: "Inovatif & Rapi",
    url: buildDiceBearUrl("calon-insinyur", "open-peeps", "c0aede"),
  },
  {
    id: "anak-ambis",
    name: "Anak Ambis",
    tag: "Target Maksimal",
    url: buildDiceBearUrl("anak-ambis", "adventurer", "d1d4f9"),
  },
  {
    id: "kutu-buku",
    name: "Kutu Buku Santai",
    tag: "Teliti & Tenang",
    url: buildDiceBearUrl("kutu-buku", "open-peeps", "ffd5dc"),
  },
  {
    id: "sang-kreator",
    name: "Sang Kreator",
    tag: "Eksploratif",
    url: buildDiceBearUrl("sang-kreator", "adventurer", "d5f4e6"),
  },
  {
    id: "semangat-juang",
    name: "Semangat Juang",
    tag: "Pantang Menyerah",
    url: buildDiceBearUrl("semangat-juang", "adventurer", "fed7aa"),
  },
];

/**
 * Returns the effective avatar URL for a student:
 * - If user already has a saved image/avatar URL, returns it.
 * - If not, deterministically assigns a random avatar from the curated presets based on their ID/email.
 */
export function getStudentAvatarUrl(
  savedImage?: string | null,
  seedFallback?: string | null
): string {
  if (savedImage && savedImage.trim().length > 0) {
    return savedImage.trim();
  }

  const rawSeed = (seedFallback || "jitu-student").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hash = (hash << 5) - hash + rawSeed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PRESET_AVATARS.length;
  return PRESET_AVATARS[index].url;
}

/**
 * Generates a randomized list of avatars for the user to pick from.
 */
export function generateRandomAvatars(count = 8, batch = 0): PresetAvatar[] {
  const styles: AvatarStyle[] = ["adventurer", "open-peeps", "lorelei"];
  return Array.from({ length: count }, (_, i) => {
    const seed = `jitu-random-${batch}-${i}-${Date.now().toString(36)}`;
    const style = styles[i % styles.length];
    const bg = PASTEL_PALETTE[i % PASTEL_PALETTE.length];
    return {
      id: seed,
      name: `Karakter #${i + 1}`,
      tag: style === "open-peeps" ? "Doodle" : "Kartun",
      url: buildDiceBearUrl(seed, style, bg),
    };
  });
}
