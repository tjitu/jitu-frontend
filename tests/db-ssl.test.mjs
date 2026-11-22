import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./helpers/extensionless-ts-hooks.mjs", import.meta.url);
const { resolveDatabaseConnection } = await import("../lib/db.ts");
const { SUPABASE_ROOT_CA_2021 } = await import("../lib/db.ts");

const POOLER = "postgresql://postgres.abcdefghij:s3cret@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres";

test("Supabase hosts are verified against the pinned Supabase root CA", () => {
  for (const url of [
    POOLER,
    "postgresql://postgres.x:pw@aws-1-eu-west-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:pw@db.abcdefghij.supabase.co:5432/postgres",
  ]) {
    const result = resolveDatabaseConnection(url, {});
    assert.equal(result.verified, true, url);
    assert.equal(result.ssl.rejectUnauthorized, true, url);
    assert.deepEqual(result.ssl.ca, [SUPABASE_ROOT_CA_2021], url);
  }
});

test("lookalike hosts are not treated as Supabase", () => {
  for (const host of [
    "supabase.com.attacker.example",
    "evil-supabase.com",
    "notsupabase.co",
    "aws-0.pooler.supabase.com.evil.example",
  ]) {
    const result = resolveDatabaseConnection(`postgresql://u:p@${host}:6543/postgres`, {});
    assert.equal(result.verified, false, host);
    assert.equal(result.ssl.ca, undefined, host);
  }
});

test("ssl parameters in the URL cannot override the configured verification", () => {
  for (const query of ["sslmode=require", "sslmode=no-verify", "sslmode=verify-full", "sslmode=disable", "ssl=true", "uselibpqcompat=true&sslmode=require", "sslrootcert=system"]) {
    const result = resolveDatabaseConnection(`${POOLER}?${query}`, {});
    assert.equal(result.connectionString, POOLER, query);
    assert.equal(result.ssl.rejectUnauthorized, true, query);
  }
});

test("unrelated URL parameters and credentials are preserved byte for byte", () => {
  assert.equal(resolveDatabaseConnection(`${POOLER}?pgbouncer=true`, {}).connectionString, `${POOLER}?pgbouncer=true`);
  assert.equal(resolveDatabaseConnection(`${POOLER}?pgbouncer=true&sslmode=require`, {}).connectionString, `${POOLER}?pgbouncer=true`);
  assert.equal(resolveDatabaseConnection(`${POOLER}?sslmode=require&schema=jitu`, {}).connectionString, `${POOLER}?schema=jitu`);
  const odd = "postgresql://postgres.abc:p%40ss%23w%3Ard@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres";
  assert.equal(resolveDatabaseConnection(odd, {}).connectionString, odd);
  const rawSpecial = "postgresql://postgres.abc:p@ss#w:rd@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require";
  assert.equal(resolveDatabaseConnection(rawSpecial, {}).connectionString, "postgresql://postgres.abc:p@ss#w:rd@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres");
});

test("DATABASE_SSL_VERIFY=false is an explicit, visible escape hatch", () => {
  const result = resolveDatabaseConnection(POOLER, { DATABASE_SSL_VERIFY: "false" });
  assert.equal(result.verified, false);
  assert.deepEqual(result.ssl, { rejectUnauthorized: false });
  assert.equal(resolveDatabaseConnection(POOLER, { DATABASE_SSL_VERIFY: "true" }).verified, true);
  assert.equal(resolveDatabaseConnection(POOLER, { DATABASE_SSL_VERIFY: "FALSE " }).verified, false);
});

test("other hosts keep the old behaviour unless a CA is supplied", () => {
  const local = "postgresql://u:p@localhost:5432/app";
  assert.deepEqual(resolveDatabaseConnection(local, {}).ssl, { rejectUnauthorized: false });
  assert.equal(resolveDatabaseConnection(local, {}).verified, false);

  const pem = "-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----";
  const withCa = resolveDatabaseConnection(local, { DATABASE_CA_CERT: pem.replace(/\n/g, "\\n") });
  assert.equal(withCa.verified, true);
  assert.deepEqual(withCa.ssl.ca, [pem]);
  assert.equal(withCa.ssl.rejectUnauthorized, true);

  const both = resolveDatabaseConnection(POOLER, { DATABASE_CA_CERT: pem });
  assert.deepEqual(both.ssl.ca, [SUPABASE_ROOT_CA_2021, pem]);
});

test("host extraction copes with IPv6, missing passwords and odd casing", () => {
  assert.equal(resolveDatabaseConnection("postgresql://u:p@[::1]:5432/db", {}).verified, false);
  assert.equal(resolveDatabaseConnection("postgresql://u@AWS-0-AP-SOUTHEAST-2.POOLER.SUPABASE.COM:6543/db", {}).verified, true);
  assert.equal(resolveDatabaseConnection("postgres://aws-0-x.pooler.supabase.com/db", {}).verified, true);
  assert.equal(resolveDatabaseConnection("not a url", {}).verified, false);
});

test("the pinned certificate is a self-signed CA that is still valid", async () => {
  const { X509Certificate } = await import("node:crypto");
  const cert = new X509Certificate(SUPABASE_ROOT_CA_2021);
  assert.equal(cert.ca, true);
  assert.equal(cert.subject, cert.issuer);
  assert.ok(cert.verify(cert.publicKey), "must be self-signed");
  assert.match(cert.subject, /Supabase Root 2021 CA/);
  const daysLeft = (new Date(cert.validTo) - Date.now()) / 86_400_000;
  assert.ok(daysLeft > 90, `the pinned root expires in ${Math.floor(daysLeft)} days, plan its replacement`);
});
