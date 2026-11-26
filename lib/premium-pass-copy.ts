/** Shared product language for marketing, upgrade prompts, and purchase summaries. */
export const PREMIUM_PASS_COPY = {
  name: "PTN Premium Pass",
  shortName: "Premium Pass",
  headline: "Sebulan latihan soal tanpa batas, lengkap dengan pembahasan.",
  monthlyPractice: "Sebulan latihan soal tanpa batas",
  practiceExplanations: "Lengkap dengan pembahasan",
  bannerDuration: "Akses Premium selama 30 hari",
  tryoutAccess: "Akses skor IRT & pembahasan tryout mingguan.",
  practiceAccess: "Bebas pilih 7 subtes SNBT",
  historyAccess: "Riwayat latihan & pembahasan selama Premium aktif",
  activation: "Akses aktif selama 30 hari setelah pembayaran berhasil.",
  period: "/bulan",
  duration: "30 hari akses",
  cta: "Aktifkan Premium",
  ctaCompact: "Aktifkan",
  active: "Premium Pass aktif",
  dailyLimit: "Batas 10 soal harian tercapai. Aktifkan Premium.",
} as const;

export function isPremiumPassPackage(name: string | null | undefined): boolean {
  return Boolean(name?.toLowerCase().includes("pass"));
}

export function getShopPackageName(name: string): string {
  return isPremiumPassPackage(name) ? PREMIUM_PASS_COPY.name : name;
}

export function getShopPackageAccess(name: string, coinAmount: number): string {
  return isPremiumPassPackage(name) ? PREMIUM_PASS_COPY.duration : `${coinAmount} coin`;
}
