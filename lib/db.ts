import pg from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Supabase Root 2021 CA, the trust anchor of every Supabase pooler certificate
// (chain: *.pooler.supabase.com -> Supabase Intermediate 2021 CA -> this root).
//
// SHA-256 fingerprint : 80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA
// Valid               : Apr 28 10:56:53 2021 GMT  ->  Apr 26 10:56:53 2031 GMT
//
// Compare the fingerprint with the certificate in Supabase Dashboard -> Project Settings ->
// Database -> SSL Configuration before relying on it. This root expires in 2031, so plan the
// replacement before then. It is a public certificate and contains no secret.
export const SUPABASE_ROOT_CA_2021 = `-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
BQAwazELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5l
dyBDYXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJh
c2UgUm9vdCAyMDIxIENBMB4XDTIxMDQyODEwNTY1M1oXDTMxMDQyNjEwNTY1M1ow
azELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5ldyBD
YXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJhc2Ug
Um9vdCAyMDIxIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQXW
QyHOB+qR2GJobCq/CBmQ40G0oDmCC3mzVnn8sv4XNeWtE5XcEL0uVih7Jo4Dkx1Q
DmGHBH1zDfgs2qXiLb6xpw/CKQPypZW1JssOTMIfQppNQ87K75Ya0p25Y3ePS2t2
GtvHxNjUV6kjOZjEn2yWEcBdpOVCUYBVFBNMB4YBHkNRDa/+S4uywAoaTWnCJLUi
cvTlHmMw6xSQQn1UfRQHk50DMCEJ7Cy1RxrZJrkXXRP3LqQL2ijJ6F4yMfh+Gyb4
O4XajoVj/+R4GwywKYrrS8PrSNtwxr5StlQO8zIQUSMiq26wM8mgELFlS/32Uclt
NaQ1xBRizkzpZct9DwIDAQABo2AwXjALBgNVHQ8EBAMCAQYwHQYDVR0OBBYEFKjX
uXY32CztkhImng4yJNUtaUYsMB8GA1UdIwQYMBaAFKjXuXY32CztkhImng4yJNUt
aUYsMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8spzNn+4VU
tVxbdMaX+39Z50sc7uATmus16jmmHjhIHz+l/9GlJ5KqAMOx26mPZgfzG7oneL2b
VW+WgYUkTT3XEPFWnTp2RJwQao8/tYPXWEJDc0WVQHrpmnWOFKU/d3MqBgBm5y+6
jB81TU/RG2rVerPDWP+1MMcNNy0491CTL5XQZ7JfDJJ9CCmXSdtTl4uUQnSuv/Qx
Cea13BX2ZgJc7Au30vihLhub52De4P/4gonKsNHYdbWjg7OWKwNv/zitGDVDB9Y2
CMTyZKG3XEu5Ghl1LEnI3QmEKsqaCLv12BnVjbkSeZsMnevJPs1Ye6TjjJwdik5P
o/bKiIz+Fq8=
-----END CERTIFICATE-----
`;

export interface DatabaseConnection {
  /** The URL to hand to pg. For verified connections the ssl* parameters are removed (see below). */
  connectionString: string;
  ssl: { rejectUnauthorized: boolean; ca?: string[] };
  /** True when the server certificate is checked against a trusted CA. */
  verified: boolean;
}

// node-postgres lets parameters in the connection string override the `ssl` option, and
// `sslmode=require` turns into `ssl: {}` (verify against Node's built-in roots, which cannot
// validate Supabase). Removing them makes the configuration below the only authority.
const SSL_URL_PARAMS = new Set(["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert", "sslcrl", "uselibpqcompat"]);

function stripSslParams(url: string): string {
  // Credentials may contain raw "@", "#" or ":" characters, so only look for the query
  // string after the last "@".
  const searchFrom = Math.max(url.lastIndexOf("@"), 0);
  const queryStart = url.indexOf("?", searchFrom);
  if (queryStart === -1) return url;

  const kept = url
    .slice(queryStart + 1)
    .split("&")
    .filter((param) => param && !SSL_URL_PARAMS.has(param.split("=")[0].toLowerCase()));
  return kept.length > 0 ? `${url.slice(0, queryStart)}?${kept.join("&")}` : url.slice(0, queryStart);
}

function extractHost(url: string): string {
  const match = /^[a-z][a-z0-9+.-]*:\/\/(.*)$/i.exec(url);
  if (!match) return "";
  const rest = match[1];
  const authorityEnd = rest.search(/[/?]/);
  const authority = authorityEnd === -1 ? rest : rest.slice(0, authorityEnd);
  const hostPort = authority.slice(authority.lastIndexOf("@") + 1);
  const host = hostPort.startsWith("[") ? hostPort.slice(1, Math.max(hostPort.indexOf("]"), 1)) : hostPort.replace(/:\d*$/, "");
  return host.toLowerCase();
}

function isSupabaseHost(host: string): boolean {
  return ["supabase.com", "supabase.co"].some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function normalizePem(value: string | undefined): string | null {
  const pem = value?.replace(/\\n/g, "\n").trim();
  return pem ? pem : null;
}

/**
 * Decides how the application talks TLS to Postgres.
 *
 * - Supabase hosts are verified against the pinned Supabase root CA (plus DATABASE_CA_CERT if given).
 * - Any other host is verified only when DATABASE_CA_CERT is provided; otherwise it keeps the
 *   previous behaviour (encrypted, certificate not checked).
 * - DATABASE_SSL_VERIFY=false switches verification off everywhere. It exists so a certificate
 *   problem can be worked around within one redeploy, and the caller logs a warning.
 */
export function resolveDatabaseConnection(
  rawUrl: string,
  env: Record<string, string | undefined> = {}
): DatabaseConnection {
  if (env.DATABASE_SSL_VERIFY?.trim().toLowerCase() === "false") {
    return { connectionString: rawUrl, ssl: { rejectUnauthorized: false }, verified: false };
  }

  const extraCa = normalizePem(env.DATABASE_CA_CERT);
  const ca = [...(isSupabaseHost(extractHost(rawUrl)) ? [SUPABASE_ROOT_CA_2021] : []), ...(extraCa ? [extraCa] : [])];

  if (ca.length === 0) {
    return { connectionString: rawUrl, ssl: { rejectUnauthorized: false }, verified: false };
  }
  return { connectionString: stripSslParams(rawUrl), ssl: { rejectUnauthorized: true, ca }, verified: true };
}

let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!poolInstance) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error("DATABASE_URL environment variable is required.");
    }
    // For Supabase pooler, port 6543 (transaction pooling) is much faster and more reliable
    const pooledUrl = rawUrl.includes("pooler.supabase.com")
      ? rawUrl.replace(":5432", ":6543")
      : rawUrl;

    // Supabase certificates are verified against the pinned Supabase root CA; see lib/db-ssl.ts.
    const { connectionString, ssl, verified } = resolveDatabaseConnection(pooledUrl, process.env);
    if (!verified) {
      console.warn(
        "[db] TLS certificate verification is OFF for the database connection. " +
          "Remove DATABASE_SSL_VERIFY=false, or provide DATABASE_CA_CERT for non-Supabase hosts."
      );
    }

    poolInstance = new pg.Pool({
      connectionString,
      ssl,
      max: 5,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });
    attachDatabasePool(poolInstance);
  }
  return poolInstance;
}
