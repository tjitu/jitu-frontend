import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

// TOKEN_MODULE lets us run the same suite against an older implementation.
const modulePath = process.env.TOKEN_MODULE || "../lib/firebase-token.ts";
const { verifyFirebaseIdToken } = await import(modulePath);

const PROJECT = "jitu-test-project";
const NOW_MS = 1_800_000_000_000;
const nowSec = Math.floor(NOW_MS / 1000);

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherKey = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicPem = publicKey.export({ type: "spki", format: "pem" });

const b64 = (value) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");

function claims(overrides = {}) {
  return {
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    auth_time: nowSec - 100,
    iat: nowSec - 100,
    exp: nowSec + 3000,
    sub: "uid-123",
    user_id: "uid-123",
    email: "victim@example.com",
    email_verified: true,
    ...overrides,
  };
}

function sign(header, payload, key = privateKey) {
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), key).toString("base64url");
  return `${signingInput}.${signature}`;
}

function options(certs = { "kid-1": publicPem }) {
  let fetches = 0;
  return {
    projectId: PROJECT,
    now: () => NOW_MS,
    fetchCerts: async () => {
      fetches += 1;
      return certs;
    },
    get fetches() {
      return fetches;
    },
  };
}

test("a genuine token signed by a published key is accepted", async () => {
  const token = sign({ alg: "RS256", kid: "kid-1", typ: "JWT" }, claims());
  const payload = await verifyFirebaseIdToken(token, options());
  assert.equal(payload?.sub, "uid-123");
  assert.equal(payload?.email, "victim@example.com");
});

test("a forged token with no kid header is rejected", async () => {
  const forged = `${b64({ alg: "RS256", typ: "JWT" })}.${b64(claims())}.${b64("not-a-signature")}`;
  assert.equal(await verifyFirebaseIdToken(forged, options()), null);
});

test("a forged token whose kid is not published is rejected", async () => {
  const forged = sign({ alg: "RS256", kid: "attacker-kid" }, claims(), otherKey.privateKey);
  assert.equal(await verifyFirebaseIdToken(forged, options()), null);
});

test("a token signed with a different key under a known kid is rejected", async () => {
  const forged = sign({ alg: "RS256", kid: "kid-1" }, claims(), otherKey.privateKey);
  assert.equal(await verifyFirebaseIdToken(forged, options()), null);
});

test("alg none and non-RS256 algorithms are rejected", async () => {
  const none = `${b64({ alg: "none", kid: "kid-1" })}.${b64(claims())}.`;
  assert.equal(await verifyFirebaseIdToken(none, options()), null);
  const hmac = `${b64({ alg: "HS256", kid: "kid-1" })}.${b64(claims())}.${b64("x")}`;
  assert.equal(await verifyFirebaseIdToken(hmac, options()), null);
});

test("tampering with the payload after signing is rejected", async () => {
  const header = { alg: "RS256", kid: "kid-1" };
  const [h, , s] = sign(header, claims()).split(".");
  const tampered = `${h}.${b64(claims({ email: "admin@example.com" }))}.${s}`;
  assert.equal(await verifyFirebaseIdToken(tampered, options()), null);
});

test("when Google certificates cannot be loaded, nothing is accepted", async () => {
  const token = sign({ alg: "RS256", kid: "kid-1" }, claims());
  assert.equal(await verifyFirebaseIdToken(token, options({})), null);
  const failing = { projectId: PROJECT, now: () => NOW_MS, fetchCerts: async () => { throw new Error("offline"); } };
  assert.equal(await verifyFirebaseIdToken(token, failing), null);
});

test("wrong audience, issuer, expiry, empty subject, or future issue time are rejected", async () => {
  const header = { alg: "RS256", kid: "kid-1" };
  const bad = [
    claims({ aud: "other-project" }),
    claims({ iss: "https://securetoken.google.com/other-project" }),
    claims({ exp: nowSec - 3600 }),
    claims({ sub: "" }),
    claims({ sub: undefined, user_id: undefined }),
    claims({ iat: nowSec + 86_400 }),
    claims({ exp: undefined }),
  ];
  for (const payload of bad) {
    assert.equal(await verifyFirebaseIdToken(sign(header, payload), options()), null, JSON.stringify(payload));
  }
});

test("malformed input never throws and never authenticates", async () => {
  for (const value of ["", "a.b", "a.b.c.d", "....", "%%%.%%%.%%%", null, undefined, 42]) {
    assert.equal(await verifyFirebaseIdToken(value, options()), null);
  }
});

test("a flood of unknown key ids cannot make the server hammer Google", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ "kid-1": publicPem }), { status: 200 });
  };
  try {
    // Default certificate fetcher (cache + throttled refresh), only the clock is injected.
    const opts = { projectId: PROJECT, now: () => NOW_MS };
    for (let i = 0; i < 20; i += 1) {
      const forged = sign({ alg: "RS256", kid: `random-${i}` }, claims(), otherKey.privateKey);
      assert.equal(await verifyFirebaseIdToken(forged, opts), null);
    }
    const genuine = sign({ alg: "RS256", kid: "kid-1" }, claims());
    assert.equal((await verifyFirebaseIdToken(genuine, opts))?.sub, "uid-123");
    assert.ok(calls <= 2, `expected at most 2 certificate downloads, got ${calls}`);
  } finally {
    globalThis.fetch = realFetch;
  }
});
