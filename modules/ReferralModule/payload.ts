import { ReferralCheckResult } from "./interface";

// Sample referral codes for demonstration
export const validReferralCodes: { [key: string]: ReferralCheckResult } = {
  JITU2026: {
    exists: true,
    message: "Kode referral valid!",
    ownerName: "Hakim Nizami",
    benefits: [
      "Diskon 20% untuk paket Bundle",
      "Bonus 5x Try Out Premium",
      "Akses gratis materi belajar selama 1 bulan",
    ],
  },
  UTBK2026: {
    exists: true,
    message: "Kode referral valid!",
    ownerName: "Ahmad Fauzi",
    benefits: [
      "Diskon 15% untuk paket Try Out",
      "Bonus 3x Try Out Premium",
      "Akses gratis materi belajar selama 2 minggu",
    ],
  },
  SNBT2026: {
    exists: true,
    message: "Kode referral valid!",
    ownerName: "Sarah Wijaya",
    benefits: [
      "Diskon 25% untuk paket Belajar",
      "Bonus 10x Try Out Premium",
      "Akses gratis materi belajar selama 2 bulan",
    ],
  },
};

export const checkReferralCode = (code: string): ReferralCheckResult => {
  const upperCode = code.toUpperCase().trim();

  if (!code || code.trim() === "") {
    return {
      exists: false,
      message: "Silakan masukkan kode referral",
    };
  }

  if (validReferralCodes[upperCode]) {
    return validReferralCodes[upperCode];
  }

  return {
    exists: false,
    message: "Kode referral tidak ditemukan",
  };
};
