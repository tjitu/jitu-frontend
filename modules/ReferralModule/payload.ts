import { ReferralCheckResult } from "./interface";

// Sample referral codes for demonstration
export const validReferralCodes: { [key: string]: ReferralCheckResult } = {
  JITU2026: {
    exists: true,
    message: "Kode referral valid.",
    ownerName: "Hakim Nizami",
    benefits: [
      "Bonus 5 coin untuk pembahasan tryout",
      "Diskon 20% pembelian paket coin",
    ],
  },
  UTBK2026: {
    exists: true,
    message: "Kode referral valid.",
    ownerName: "Ahmad Fauzi",
    benefits: [
      "Bonus 3 coin untuk pembahasan tryout",
      "Diskon 15% pembelian paket coin",
    ],
  },
  SNBT2026: {
    exists: true,
    message: "Kode referral valid.",
    ownerName: "Sarah Wijaya",
    benefits: [
      "Bonus 10 coin untuk pembahasan tryout",
      "Diskon 25% pembelian paket coin",
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
