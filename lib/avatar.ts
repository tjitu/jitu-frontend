/**
 * JITU Student Avatar System
 * Generates modern, aesthetic illustrated avatars (DiceBear 9.x: lorelei & micah)
 * with a clean round avatar picker for students.
 */

export type AvatarStyle = "lorelei" | "micah";

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
  name?: string;
  tag?: string;
  url: string;
}

/**
 * Builds a DiceBear avatar URL for a given seed, style, and optional background color.
 */
export function buildDiceBearUrl(
  seed: string,
  style: AvatarStyle = "lorelei",
  bgColor?: string
): string {
  const cleanSeed = encodeURIComponent(seed.trim());
  const bgParam = bgColor || PASTEL_PALETTE.join(",");
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&backgroundColor=${bgParam}`;
}

const PRESET_SEEDS: Array<{ seed: string; style: AvatarStyle; bg: string }> = [
  // Aesthetic Lorelei characters (Anime / Webtoon clean art style)
  { seed: "Aria", style: "lorelei", bg: "b6e3f4" },
  { seed: "Kenji", style: "lorelei", bg: "ffd5dc" },
  { seed: "Maya", style: "lorelei", bg: "c0aede" },
  { seed: "Liam", style: "lorelei", bg: "d5f4e6" },
  { seed: "Chloe", style: "lorelei", bg: "ffdfbf" },
  { seed: "Leo", style: "lorelei", bg: "d1d4f9" },
  { seed: "Sophie", style: "lorelei", bg: "fed7aa" },
  { seed: "Lucas", style: "lorelei", bg: "b6e3f4" },
  { seed: "Nadia", style: "lorelei", bg: "ffd5dc" },
  { seed: "Rian", style: "lorelei", bg: "c0aede" },
  { seed: "Zahra", style: "lorelei", bg: "d5f4e6" },
  { seed: "Dimas", style: "lorelei", bg: "d1d4f9" },

  // Sleek Micah characters (Modern clean designer vector style)
  { seed: "Felix", style: "micah", bg: "b6e3f4" },
  { seed: "Luna", style: "micah", bg: "ffd5dc" },
  { seed: "Oliver", style: "micah", bg: "c0aede" },
  { seed: "Emma", style: "micah", bg: "d5f4e6" },
  { seed: "Aris", style: "micah", bg: "ffdfbf" },
  { seed: "Putri", style: "micah", bg: "d1d4f9" },
  { seed: "Budi", style: "micah", bg: "fed7aa" },
  { seed: "Dewi", style: "micah", bg: "b6e3f4" },
  { seed: "Reza", style: "micah", bg: "ffd5dc" },
  { seed: "Tari", style: "micah", bg: "c0aede" },
  { seed: "Fajar", style: "micah", bg: "d5f4e6" },
  { seed: "Hana", style: "micah", bg: "d1d4f9" },
];

/**
 * Curated preset avatars reflecting clean, aesthetic student styles.
 */
export const PRESET_AVATARS: PresetAvatar[] = PRESET_SEEDS.map((item, index) => ({
  id: `preset-${index}-${item.seed.toLowerCase()}`,
  url: buildDiceBearUrl(item.seed, item.style, item.bg),
}));

/**
 * Returns the effective avatar URL for a student:
 * - If user already has a saved image/avatar URL, returns it.
 * - If not, deterministically assigns a clean avatar from presets based on user ID or email seed.
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
 * Generates a randomized list of aesthetic avatars for the user to pick from.
 */
export function generateRandomAvatars(count = 24, batch = 0): PresetAvatar[] {
  const styles: AvatarStyle[] = ["lorelei", "micah"];
  return Array.from({ length: count }, (_, i) => {
    const seed = `student-${batch}-${i}-${Date.now().toString(36)}`;
    const style = styles[i % styles.length];
    const bg = PASTEL_PALETTE[i % PASTEL_PALETTE.length];
    return {
      id: seed,
      url: buildDiceBearUrl(seed, style, bg),
    };
  });
}
