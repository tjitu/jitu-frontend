// Read-only load test for jituptn.com's public, non-destructive endpoints,
// using `autocannon` (pure Node.js, no extra install — npx downloads it on
// first run and caches it). Equivalent in spirit to loadtest/k6-smoke.js,
// for machines that can't install the k6 CLI.
//
// What this does: runs short bursts of increasing concurrency against the
// homepage, the lightweight liveness check, and two public GET endpoints
// that touch the database. No login, no writes, no admin routes.
//
// How to run:
//   npx autocannon --help   (first run downloads autocannon; confirm if npm asks)
//   node loadtest/autocannon-smoke.mjs
//   BASE_URL=http://localhost:3000 MAX_CONN=10 node loadtest/autocannon-smoke.mjs
//
// Start small (MAX_CONN=10-20) against production. Watch Supabase's
// Connection Pooling page (client connections, pool size) while it runs, and
// stop raising MAX_CONN the moment errors or non-2xx responses show up.
// This is a manual, supervised check — never schedule it to run unattended.

import autocannon from "autocannon";

const BASE_URL = (process.env.BASE_URL || "https://jituptn.com").replace(/\/$/, "");
const MAX_CONN = Number(process.env.MAX_CONN || 20);

const targets = [
  { path: "/api/health", label: "health" },
  { path: "/", label: "home" },
  { path: "/api/hiring", label: "hiring_public" },
  { path: "/api/proxy/dashboard/tryouts/available", label: "tryout_list" },
];

// Three phases of increasing concurrency, mirroring the k6 script's ramp.
const phases = [
  { connections: Math.max(1, Math.ceil(MAX_CONN * 0.25)), duration: 15 },
  { connections: MAX_CONN, duration: 30 },
  { connections: MAX_CONN, duration: 30 },
];

function runPhase(url, label, connections, duration) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections,
        duration,
        headers: { "User-Agent": "JituLoadTest/1.0 (manual, read-only)" },
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    autocannon.track(instance, { renderProgressBar: true, renderResultsTable: false });
  });
}

async function main() {
  console.log(`Target: ${BASE_URL} — max concurrency ${MAX_CONN}\n`);

  for (const target of targets) {
    const url = `${BASE_URL}${target.path}`;
    console.log(`\n=== ${target.label} (${target.path}) ===`);

    for (const phase of phases) {
      const result = await runPhase(url, target.label, phase.connections, phase.duration);
      const errorRate = result.errors / Math.max(1, result.requests.total);
      const non2xx = result.non2xx ?? 0;

      console.log(
        `  conns=${phase.connections} dur=${phase.duration}s  ` +
          `p95=${result.latency.p99}ms(p99) p50=${result.latency.p50}ms  ` +
          `req/s=${Math.round(result.requests.average)}  ` +
          `errors=${result.errors} non2xx=${non2xx}`,
      );

      if (errorRate > 0.01 || non2xx > 0) {
        console.log(`  !! stopping ${target.label}: error/non-2xx rate above 1%, back off here.`);
        break;
      }
    }
  }
}

main().catch((error) => {
  console.error("Load test failed:", error);
  process.exitCode = 1;
});
