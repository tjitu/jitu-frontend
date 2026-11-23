// Read-only load test for jituptn.com's public, non-destructive endpoints —
// paced like real people instead of a tight back-to-back loop.
//
// Why this exists: loadtest/node-smoke.mjs fires each "connection" as fast as
// possible with zero pause between requests. That's useful for finding a raw
// throughput ceiling, but it also looks exactly like a volumetric attack to
// Vercel's built-in, always-on DDoS mitigation (not something togglable on
// the Hobby plan) — which is what challenged real student traffic earlier.
// This script instead gives each simulated "user" a random pause between
// actions, like someone reading a question before clicking an answer, so a
// given concurrency number maps much more directly to "this many people
// browsing right now" instead of "this many requests per second."
//
// Still read-only: GET only, no login, no writes, no admin routes.
//
// How to run (PowerShell or cmd.exe, both work):
//   node loadtest/human-pace.mjs
//   set MAX_USERS=150 && node loadtest\human-pace.mjs            (cmd.exe)
//   $env:MAX_USERS=150; node loadtest/human-pace.mjs             (PowerShell)
//
// Tuning (all optional):
//   MAX_USERS        peak number of simulated concurrent people (default 100)
//   THINK_MIN_MS      shortest pause between a user's actions (default 3000)
//   THINK_MAX_MS      longest pause between a user's actions   (default 8000)
//   PHASE_SECONDS     how long each ramp step runs             (default 45)
//
// Even this paced version is still real traffic from one IP, so start modest
// (MAX_USERS=50-100), watch Supabase's Connection Pooling page and the
// Vercel Firewall Traffic graph while it runs, and stop raising MAX_USERS if
// "Challenged" starts climbing again. Manual, supervised check only — never
// schedule this to run unattended.

import https from "node:https";
import http from "node:http";
import { performance } from "node:perf_hooks";

const BASE_URL = (process.env.BASE_URL || "https://jituptn.com").replace(/\/$/, "");
const MAX_USERS = Math.max(1, Number(process.env.MAX_USERS || 100));
const THINK_MIN_MS = Math.max(0, Number(process.env.THINK_MIN_MS || 3000));
const THINK_MAX_MS = Math.max(THINK_MIN_MS, Number(process.env.THINK_MAX_MS || 8000));
const PHASE_MS = Math.max(5000, Number(process.env.PHASE_SECONDS || 45) * 1000);
const client = BASE_URL.startsWith("https:") ? https : http;

// A real person bounces between a couple of different pages, not one
// endpoint on repeat — mix requests across these instead of isolating them.
const ENDPOINTS = [
  "/api/health",
  "/api/hiring",
  "/api/proxy/dashboard/tryouts/available",
];

const RAMP_FRACTIONS = [0.25, 0.5, 0.75, 1];
const phases = RAMP_FRACTIONS.map((fraction) => ({
  users: Math.max(1, Math.round(MAX_USERS * fraction)),
  durationMs: PHASE_MS,
}));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function requestOnce(path) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const req = client.get(
      `${BASE_URL}${path}`,
      { headers: { "User-Agent": "JituLoadTest/1.0 (manual, read-only, paced)" } },
      (res) => {
        res.resume();
        res.on("end", () => resolve({ status: res.statusCode ?? 0, ms: performance.now() - startedAt }));
      },
    );
    req.setTimeout(10_000, () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve({ status: 0, ms: performance.now() - startedAt }));
  });
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[index]);
}

// One "person": waits a random beat, picks a random page, requests it,
// repeat until the phase ends. No two people start in lockstep (staggered
// initial delay), and no two requests from the same person land back to
// back without a pause — the opposite of node-smoke.mjs on purpose.
async function simulateUser(deadline, stats) {
  await sleep(Math.random() * THINK_MAX_MS); // stagger arrival
  while (performance.now() < deadline) {
    const path = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    const result = await requestOnce(path);
    stats.total += 1;
    if (result.status === 0) stats.errors += 1;
    else if (result.status >= 400) stats.non2xx += 1;
    else stats.latencies.push(result.ms);
    await sleep(randomBetween(THINK_MIN_MS, THINK_MAX_MS));
  }
}

async function runPhase(users, durationMs) {
  const deadline = performance.now() + durationMs;
  const stats = { total: 0, errors: 0, non2xx: 0, latencies: [] };
  await Promise.all(Array.from({ length: users }, () => simulateUser(deadline, stats)));
  stats.latencies.sort((a, b) => a - b);
  return {
    total: stats.total,
    errors: stats.errors,
    non2xx: stats.non2xx,
    p50: percentile(stats.latencies, 50),
    p95: percentile(stats.latencies, 95),
  };
}

async function main() {
  console.log(
    `Target: ${BASE_URL} — up to ${MAX_USERS} simulated people, ` +
      `thinking ${THINK_MIN_MS}-${THINK_MAX_MS}ms between actions\n`,
  );

  for (const phase of phases) {
    const result = await runPhase(phase.users, phase.durationMs);
    const errorRate = (result.errors + result.non2xx) / Math.max(1, result.total);
    const reqPerSec = (result.total / (phase.durationMs / 1000)).toFixed(1);
    console.log(
      `people=${phase.users} dur=${phase.durationMs / 1000}s  ` +
        `req=${result.total} (${reqPerSec}/s)  p50=${result.p50}ms p95=${result.p95}ms  ` +
        `errors=${result.errors} non2xx=${result.non2xx}`,
    );
    if (errorRate > 0.01) {
      console.log(`!! stopping: error/non-2xx rate above 1% at ${phase.users} people, back off here.`);
      break;
    }
  }
}

main().catch((error) => {
  console.error("Load test failed:", error);
  process.exitCode = 1;
});
