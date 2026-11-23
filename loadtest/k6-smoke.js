// Read-only load test for jituptn.com's public, non-destructive endpoints.
//
// What this does: ramps up virtual users gradually and hits the homepage,
// the lightweight liveness check, and a couple of public GET endpoints that
// touch the database (tryout listing, hiring stats). It never logs in,
// never submits a Tryout answer, never writes data, and never hits /admin
// routes — so running it repeatedly is safe for the data in the database.
//
// What this does NOT do: simulate a real "everyone opens Tryout at 06:00"
// stampede (that also includes auth, WebSocket/session state, and answer
// submission), and it is not a substitute for watching Supabase's pooler
// metrics (pgbouncer client/pool usage) while it runs.
//
// How to run (you need the k6 CLI: https://k6.io/docs/get-started/installation/):
//   k6 run loadtest/k6-smoke.js
//   k6 run --env BASE_URL=http://localhost:3000 --env MAX_VUS=20 loadtest/k6-smoke.js
//
// Start small (MAX_VUS=10-20) against production. Only raise MAX_VUS once you've
// watched Supabase's Connection Pooling page (client connections, pool size) and
// confirmed nothing else is relying on headroom at the same time. Never run this
// unattended on a schedule — it is a manual, supervised check.

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = (__ENV.BASE_URL || "https://jituptn.com").replace(/\/$/, "");
const MAX_VUS = Number(__ENV.MAX_VUS || 20);

export const options = {
  scenarios: {
    ramping_traffic: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: Math.ceil(MAX_VUS * 0.25) },
        { duration: "1m", target: MAX_VUS },
        { duration: "1m", target: MAX_VUS }, // hold at peak
        { duration: "30s", target: 0 }, // ramp down
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // more than 1% failures aborts the test as a failure
    "http_req_duration{endpoint:health}": ["p(95)<300"],
    "http_req_duration{endpoint:home}": ["p(95)<1500"],
    "http_req_duration{endpoint:tryout_list}": ["p(95)<1500"],
  },
};

function get(path, tagEndpoint) {
  const res = http.get(`${BASE_URL}${path}`, {
    tags: { endpoint: tagEndpoint },
    headers: { "User-Agent": "JituLoadTest/1.0 (manual, read-only)" },
  });
  check(res, {
    [`${tagEndpoint}: status is 2xx/3xx`]: (r) => r.status > 0 && r.status < 400,
  });
  return res;
}

export default function () {
  get("/api/health", "health");
  sleep(0.3);
  get("/", "home");
  sleep(0.5);
  // Public summary endpoint (no ?admin=true) — returns aggregate counts only,
  // same as what any anonymous visitor's browser would request.
  get("/api/hiring", "hiring_public");
  sleep(0.5);
  // Public tryout listing used by the dashboard; read-only, no auth required
  // for the summary shape.
  get("/api/proxy/dashboard/tryouts/available", "tryout_list");
  sleep(1);
}
