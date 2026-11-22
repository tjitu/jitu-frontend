import crypto from "crypto";

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

export interface VerifyFirebaseTokenOptions {
  /** Firebase project id the token must be issued for. Defaults to the environment. */
  projectId?: string;
  /** Clock in milliseconds. Injectable for tests. */
  now?: () => number;
  /** Source of Google's signing certificates. Defaults to a cached, throttled download. */
  fetchCerts?: () => Promise<Record<string, string>>;
}

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CERT_CACHE_MS = 60 * 60 * 1000;
// Unknown key ids may mean Google rotated keys, but an attacker can send endless random
// key ids, so refreshing is allowed at most once per interval.
const CERT_FORCED_REFRESH_MIN_INTERVAL_MS = 60 * 1000;
const CLOCK_SKEW_SECONDS = 300;
const EXPIRY_LEEWAY_SECONDS = 60;

let cachedCerts: { keys: Record<string, string>; fetchedAt: number } | null = null;
let pendingCerts: Promise<Record<string, string>> | null = null;

async function downloadCerts(): Promise<Record<string, string>> {
  const res = await fetch(GOOGLE_CERTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google certificate endpoint returned ${res.status}`);
  const keys = (await res.json()) as Record<string, string>;
  cachedCerts = { keys, fetchedAt: Date.now() };
  return keys;
}

async function fetchGoogleCerts(forceRefresh: boolean): Promise<Record<string, string>> {
  const age = cachedCerts ? Date.now() - cachedCerts.fetchedAt : Infinity;
  const stale = age >= CERT_CACHE_MS;
  const refreshAllowed = forceRefresh && age >= CERT_FORCED_REFRESH_MIN_INTERVAL_MS;

  if (cachedCerts && !stale && !refreshAllowed) return cachedCerts.keys;
  if (pendingCerts) return pendingCerts;

  pendingCerts = downloadCerts().catch((err) => {
    console.warn("Failed to fetch Google public certs for token verification:", err);
    // Keep using the last known certificates if the refresh failed.
    return cachedCerts?.keys ?? {};
  });
  try {
    return await pendingCerts;
  } finally {
    pendingCerts = null;
  }
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function verifySignature(signingInput: string, signatureB64: string, cert: string): boolean {
  try {
    const signature = Buffer.from(signatureB64, "base64url");
    if (signature.length === 0) return false;
    const key = crypto.createPublicKey(cert);
    return crypto.verify("RSA-SHA256", Buffer.from(signingInput), key, signature);
  } catch {
    return false;
  }
}

/**
 * Verifies a Firebase ID token. Fails closed: a token is only returned when its RS256
 * signature was verified against a certificate Google published for the token's `kid`.
 */
export async function verifyFirebaseIdToken(
  token: unknown,
  options: VerifyFirebaseTokenOptions = {}
): Promise<FirebaseTokenPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = decodeSegment(headerB64);
    const claims = decodeSegment(payloadB64);
    if (!header || !claims) return null;

    // Only RS256 with an explicit key id is acceptable. This rules out `alg: none`,
    // HMAC confusion, and tokens that skip signature checking by omitting `kid`.
    if (header.alg !== "RS256") return null;
    if (typeof header.kid !== "string" || header.kid.length === 0) return null;

    const projectId =
      options.projectId ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      "jitu-ptn-main-auth";

    const nowSec = Math.floor((options.now ? options.now() : Date.now()) / 1000);

    if (!isNumber(claims.exp) || claims.exp < nowSec - EXPIRY_LEEWAY_SECONDS) return null;
    if (!isNumber(claims.iat) || claims.iat > nowSec + CLOCK_SKEW_SECONDS) return null;
    if (claims.auth_time !== undefined && (!isNumber(claims.auth_time) || claims.auth_time > nowSec + CLOCK_SKEW_SECONDS)) {
      return null;
    }
    if (claims.aud !== projectId) return null;
    if (claims.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof claims.sub !== "string" || claims.sub.length === 0 || claims.sub.length > 128) return null;

    const signingInput = `${headerB64}.${payloadB64}`;
    const load = options.fetchCerts ?? (() => fetchGoogleCerts(false));
    let cert = (await load())[header.kid];
    if (!cert && !options.fetchCerts) {
      // Unknown key id: Google may have rotated keys. One throttled refresh, then give up.
      cert = (await fetchGoogleCerts(true))[header.kid];
    }
    if (!cert) {
      console.warn("Firebase token rejected: unknown signing key id.");
      return null;
    }

    if (!verifySignature(signingInput, signatureB64, cert)) {
      console.warn("Firebase token signature verification failed for kid:", header.kid);
      return null;
    }

    return claims as unknown as FirebaseTokenPayload;
  } catch (err) {
    console.error("Error decoding/verifying Firebase ID token:", err);
    return null;
  }
}
