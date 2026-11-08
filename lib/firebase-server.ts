import crypto from "crypto";
import { getDbPool } from "./db";

export interface FirebaseTokenPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  firebase?: {
    identities?: Record<string, string[]>;
    sign_in_provider?: string;
  };
  name?: string;
  picture?: string;
}

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tokenBalance: number;
  target?: string | null;
  image?: string | null;
  emailVerified: boolean;
}

let cachedGoogleCerts: { keys: Record<string, string>; expiresAt: number } | null = null;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  if (cachedGoogleCerts && cachedGoogleCerts.expiresAt > Date.now()) {
    return cachedGoogleCerts.keys;
  }
  try {
    const res = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
      { cache: "no-store" }
    );
    if (res.ok) {
      const keys = (await res.json()) as Record<string, string>;
      cachedGoogleCerts = { keys, expiresAt: Date.now() + 3600 * 1000 };
      return keys;
    }
  } catch (err) {
    console.warn("Failed to fetch Google public certs for token verification:", err);
  }
  return cachedGoogleCerts?.keys || {};
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseTokenPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as FirebaseTokenPayload;

    const expectedProject =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      "jitu-ptn-main-auth-2026";

    // 1. Check expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < nowSec - 60) {
      console.warn("Firebase token expired. exp:", payload.exp, "now:", nowSec);
      return null;
    }

    // 2. Check audience and issuer
    if (payload.aud !== expectedProject) {
      console.warn("Firebase token audience mismatch:", payload.aud, "expected:", expectedProject);
      return null;
    }

    const expectedIssuer = `https://securetoken.google.com/${expectedProject}`;
    if (payload.iss !== expectedIssuer) {
      console.warn("Firebase token issuer mismatch:", payload.iss, "expected:", expectedIssuer);
      return null;
    }

    // 3. Cryptographic signature check against Google public certs
    if (header.kid) {
      const certs = await getGooglePublicCerts();
      const cert = certs[header.kid];
      if (cert) {
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(`${headerB64}.${payloadB64}`);
        const isValid = verifier.verify(cert, Buffer.from(signatureB64, "base64url"));
        if (!isValid) {
          console.warn("Firebase token signature verification failed for kid:", header.kid);
          return null;
        }
      }
    }

    return payload;
  } catch (err) {
    console.error("Error decoding/verifying Firebase ID token:", err);
    return null;
  }
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

  const pool = getDbPool();
  const provider = token.firebase?.sign_in_provider || "password";
  const providerId = resolveProviderId(provider);
  const accountId = token.sub || token.user_id;

  // 1. Try finding an existing account mapping (firebase-*)
  const mappedRes = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u."tokenBalance", u.target, u.image, u."emailVerified"
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
      target: row.target ?? null,
      image: row.image ?? null,
      emailVerified: Boolean(row.emailVerified),
    };
  }

  // 2. Try finding user by email (case-insensitive)
  const existingUserRes = await pool.query(
    `SELECT id, name, email, role, "tokenBalance", target, image, "emailVerified"
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
       RETURNING id, name, email, role, "tokenBalance", target, image, "emailVerified"`,
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
    target: userRecord.target ?? null,
    image: userRecord.image ?? null,
    emailVerified: Boolean(userRecord.emailVerified),
  };
}
