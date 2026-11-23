// Read-only load test for jituptn.com's public, non-destructive endpoints.
// Uses ONLY Node's built-in https/http modules — nothing to install, no npm,
// no pnpm, no k6. Just Node itself (already on this machine).
//
// What this does: runs a few short phases of increasing concurrency against
// the homepage, the lightweight liveness check, and two public GET endpoints
// that touch the database. No login, no writes, no admin routes.
//
// How to run (PowerShell or cmd.exe, both work — no env var needed for the
// default run):
//   node loadtest/node-smoke.mjs
//
// To change the target or peak concurrency (PowerShell):
//   $env:BASE_URL="https://jituptn.com"; $env:MAX_CONN=30; node loadtest/node-smoke.mjs
// (cmd.exe):
//   set MAX_CONN=30 && node loadtest\node-smoke.mjs
//
// The homepage ("/") is skipped by default: it's a cached static page
// (X-Vercel-Cache: HIT), so hammering it at high concurrency mostly measures
// your own connection's bandwidth downloading its ~244KB payload many times
// at once, not jituptn.com's server. Set INCLUDE_HOME=1 to add it back.
//
// Start small (MAX_CONN=10-20) against production, then raise it in steps
// (e.g. 50, 100, 150) to find where it actually breaks. Watch Supabase's
// Connection Pooling page while it runs, and stop raising MAX_CONN the
// moment errors or non-2xx responses show up. Manual, supervised check only
// — never schedule this to run unattended.

import https from "node:https";
import http from "node:http";
import { performance } from "node:perf_hooks";

const BASE_URL = (process.env.BASE_URL || "https://jituptn.com").replace(/\/$/, "");
const MAX_CONN = Math.max(1, Number(process.env.MAX_CONN || 20));
const client = BASE_URL.startsWith("https:") ? https : http;

const INCLUDE_HOME = process.env.INCLUDE_HOME === "1";

const targets = [
  { path: "/api/health", label: "health" },
  ...(INCLUDE_HOME ? [{ path: "/", label: "home" }] : []),
  { path: "/api/hiring", label: "hiring_public" },
  { path: "/api/proxy/dashboard/tryouts/available", label: "tryout_list" },
];

// Ramps in finer steps than before (25/50/75/100%) so a breaking point shows
// up as "degrades between step N and N+1" instead of "somewhere under 50".
const RAMP_FRACTIONS = [0.25, 0.5, 0.75, 1];
const phases = [
  ...RAMP_FRACTIONS.map((fraction) => ({
    connections: Math.max(1, Math.round(MAX_CONN * fraction)),
    durationMs: 10_000,
  })),
  { connections: MAX_CONN, durationMs: 20_000 }, // hold at peak once ramped up
];

function requestOnce(url) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const req = client.get(
      url,
      { headers: { "User-Agent": "JituLoadTest/1.0 (manual, read-only)" } },
      (res) => {
        res.resume(); // drain the body, we only care about status + timing
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

// One worker loops "get, then immediately get again" for the whole phase
// duration — `connections` workers running concurrently approximates that
// many people continuously browsing at once.
async function runPhase(url, connections, durationMs) {
  const deadline = performance.now() + durationMs;
  const latencies = [];
  let errors = 0;
  let non2xx = 0;
  let total = 0;

  async function worker() {
    while (performance.now() < deadline) {
      const result = await requestOnce(url);
      total += 1;
      if (result.status === 0) errors += 1;
      else if (result.status >= 400) non2xx += 1;
      else latencies.push(result.ms);
    }
  }

  await Promise.all(Array.from({ length: connections }, worker));
  latencies.sort((a, b) => a - b);
  return {
    total,
    errors,
    non2xx,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
  };
}

async function main() {
  console.log(`Target: ${BASE_URL} — max concurrency ${MAX_CONN}\n`);

  for (const target of targets) {
    const url = `${BASE_URL}${target.path}`;
    console.log(`=== ${target.label} (${target.path}) ===`);

    for (const phase of phases) {
      const result = await runPhase(url, phase.connections, phase.durationMs);
      const errorRate = (result.errors + result.non2xx) / Math.max(1, result.total);
      console.log(
        `  conns=${phase.connections} dur=${phase.durationMs / 1000}s  ` +
          `req=${result.total}  p50=${result.p50}ms p95=${result.p95}ms  ` +
          `errors=${result.errors} non2xx=${result.non2xx}`,
      );
      if (errorRate > 0.01) {
        console.log(`  !! stopping ${target.label}: error/non-2xx rate above 1%, back off here.`);
        break;
      }
    }
    console.log("");
  }
}

main().catch((error) => {
  console.error("Load test failed:", error);
  process.exitCode = 1;
});
