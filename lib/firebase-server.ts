import crypto from "crypto";
import { getDbPool } from "./db";
import { isUserPremiumActive } from "@/lib/premium";
import { verifyFirebaseIdToken, type FirebaseTokenPayload } from "./firebase-token";

export { verifyFirebaseIdToken };
export type { FirebaseTokenPayload };

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tokenBalance: number;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  target?: string | null;
  image?: string | null;
  emailVerified: boolean;
  school?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
}

function resolveProviderId(signInProvider?: string): string {
  if (signInProvider === "password") return "firebase-password";
  if (signInProvider === "google.com") return "firebase-google";
  if (!signInProvider) return "firebase-unknown";
  return `firebase-${signInProvider.replace(/[^a-z0-9-]/gi, "-")}`;
}

export async function resolveFirebaseUser(
  token: FirebaseTokenPayload
): Promise<AppUserProfile | null> {
  const email = token.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Akun Firebase harus memiliki alamat email.");
  }
  if (token.email_verified !== true) {
    throw new Error("Verifikasi email terlebih dahulu sebelum menggunakan akun Jitu.");
  }

  const pool = getDbPool();
  const provider = token.firebase?.sign_in_provider || "password";
  const providerId = resolveProviderId(provider);
  const accountId = token.sub || token.user_id;

  // 1. Try finding an existing account mapping (firebase-*)
  const mappedRes = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u."tokenBalance", u."isPremium", u."premiumExpiresAt", u.target, u.image, u."emailVerified", u.school, u."phoneNumber"
     FROM "account" a
     JOIN "user" u ON a."userId" = u.id
     WHERE a."providerId" LIKE 'firebase-%' AND a."accountId" = $1
     LIMIT 1`,
    [accountId]
  );

  if (mappedRes.rows.length > 0) {
    const row = mappedRes.rows[0];
    // Sync emailVerified if necessary
    if (token.email_verified && !row.emailVerified) {
      await pool.query(
        `UPDATE "user" SET "emailVerified" = true, "updatedAt" = NOW() WHERE id = $1`,
        [row.id]
      ).catch(() => {});
      row.emailVerified = true;
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || "USER",
      tokenBalance: Number(row.tokenBalance) || 0,
      isPremium: isUserPremiumActive({
        isPremium: row.isPremium,
        premiumExpiresAt: row.premiumExpiresAt,
      }),
      premiumExpiresAt: row.premiumExpiresAt
        ? new Date(row.premiumExpiresAt).toISOString()
        : null,
      target: row.target ?? null,
      image: row.image ?? null,
      emailVerified: Boolean(row.emailVerified),
      school: row.school ?? null,
      phone: row.phoneNumber ?? null,
      phoneNumber: row.phoneNumber ?? null,
    };
  }

  // 2. Try finding user by email (case-insensitive)
  const existingUserRes = await pool.query(
    `SELECT id, name, email, role, "tokenBalance", "isPremium", "premiumExpiresAt", target, image, "emailVerified", school, "phoneNumber"
     FROM "user"
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  let userRecord = existingUserRes.rows[0];

  if (userRecord) {
    // Link Firebase account to existing user
    const linkId = `firebase:${accountId}:${providerId}`;
    await pool.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [linkId, accountId, providerId, userRecord.id]
    ).catch((e) => console.warn("Failed linking account in DB:", e));

    if (!userRecord.emailVerified) {
      await pool.query(
        `UPDATE "user" SET "emailVerified" = true, "updatedAt" = NOW() WHERE id = $1`,
        [userRecord.id]
      ).catch(() => {});
      userRecord.emailVerified = true;
    }
  } else {
    // 3. User does not exist, auto-create student user
    const newUserId = crypto.randomUUID();
    const displayName = token.name?.trim() || email.split("@")[0];
    const image = token.picture || null;

    const insertUserRes = await pool.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, role, "tokenBalance", "currentStreak", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, $4, 'USER', 0, 0, NOW(), NOW())
       RETURNING id, name, email, role, "tokenBalance", "isPremium", "premiumExpiresAt", target, image, "emailVerified", school, "phoneNumber"`,
      [newUserId, displayName, email, image]
    );

    userRecord = insertUserRes.rows[0];

    const linkId = `firebase:${accountId}:${providerId}`;
    await pool.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [linkId, accountId, providerId, userRecord.id]
    ).catch((e) => console.warn("Failed inserting account for new user:", e));
  }

  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role || "USER",
    tokenBalance: Number(userRecord.tokenBalance) || 0,
    isPremium: isUserPremiumActive({
      isPremium: userRecord.isPremium,
      premiumExpiresAt: userRecord.premiumExpiresAt,
    }),
    premiumExpiresAt: userRecord.premiumExpiresAt
      ? new Date(userRecord.premiumExpiresAt).toISOString()
      : null,
    target: userRecord.target ?? null,
    image: userRecord.image ?? null,
    emailVerified: Boolean(userRecord.emailVerified),
    school: userRecord.school ?? null,
    phone: userRecord.phoneNumber ?? null,
    phoneNumber: userRecord.phoneNumber ?? null,
  };
}
