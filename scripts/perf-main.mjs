import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

function positiveInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function readOptions() {
  const options = {
    port: positiveInteger(process.env.PERF_PORT ?? 4173, "PERF_PORT"),
    requests: positiveInteger(process.env.PERF_REQUESTS ?? 30, "PERF_REQUESTS"),
    concurrency: (process.env.PERF_CONCURRENCY ?? "1,5,10")
      .split(",")
      .map((value) => positiveInteger(value.trim(), "PERF_CONCURRENCY")),
  };

  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  for (let index = 0; index < args.length; index += 1) {
    const [key, inlineValue] = args[index].split("=", 2);
    const value = inlineValue ?? args[index + 1];
    if (key === "--help" || key === "-h") {
      console.log(
        "Usage: node scripts/perf-main.mjs [--port N] [--requests N] [--concurrency 1,5,10]\n" +
          "The script starts a local Next production server and benchmarks only `/`.",
      );
      process.exit(0);
    }
    if (value == null || value.startsWith("--")) {
      throw new Error(`Missing value for ${key}.`);
    }
    if (key === "--port") options.port = positiveInteger(value, "--port");
    else if (key === "--requests") options.requests = positiveInteger(value, "--requests");
    else if (key === "--concurrency") {
      options.concurrency = value
        .split(",")
        .map((item) => positiveInteger(item.trim(), "--concurrency"));
    } else {
      throw new Error(`Unknown option: ${key}`);
    }
    if (inlineValue == null) index += 1;
  }

  if (options.port > 65535) throw new Error("Port must be between 1 and 65535.");
  options.concurrency = [...new Set(options.concurrency)].sort((a, b) => a - b);
  return options;
}

function percentile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(fraction * sorted.length) - 1)];
}

async function requestPage(url) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    const headersAt = performance.now();
    const body = await response.arrayBuffer();
    const completedAt = performance.now();
    return {
      status: response.status,
      ttfbMs: headersAt - startedAt,
      responseMs: completedAt - startedAt,
      bytes: body.byteLength,
    };
  } catch (error) {
    return {
      status: "ERROR",
      ttfbMs: null,
      responseMs: performance.now() - startedAt,
      bytes: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function waitForServer(server, url, recentLogs) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode != null) {
      throw new Error(
        `Next production server exited with code ${server.exitCode}.\n${recentLogs.join("")}`,
      );
    }

    const result = await requestPage(url);
    if (result.status === 200) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Next production server did not become ready at ${url}.\n${recentLogs.join("")}`,
  );
}

async function runLoad(url, requests, concurrency) {
  const results = new Array(requests);
  let nextIndex = 0;
  const startedAt = performance.now();

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= requests) return;
      results[index] = await requestPage(url);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, requests) }, () => worker()),
  );

  const wallMs = performance.now() - startedAt;
  const successful = results.filter((result) => result.status === 200);
  const countStatuses = results.reduce((counts, result) => {
    const key = String(result.status);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return {
    concurrency,
    requests,
    successful: successful.length,
    failed: requests - successful.length,
    statuses: countStatuses,
    wallMs,
    requestsPerSecond: (requests / wallMs) * 1000,
    ttfbP50Ms: percentile(
      successful.map((result) => result.ttfbMs),
      0.5,
    ),
    ttfbP95Ms: percentile(
      successful.map((result) => result.ttfbMs),
      0.95,
    ),
    responseP50Ms: percentile(
      successful.map((result) => result.responseMs),
      0.5,
    ),
    responseP95Ms: percentile(
      successful.map((result) => result.responseMs),
      0.95,
    ),
    averageHtmlBytes: successful.length
      ? successful.reduce((total, result) => total + result.bytes, 0) /
        successful.length
      : null,
  };
}

async function measureInitialAssets(html, baseUrl) {
  const baseOrigin = new URL(baseUrl).origin;
  const resources = new Map();
  const readAttribute = (tag, name) =>
    tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
  const addResource = (rawUrl, type) => {
    const url = new URL(rawUrl.replaceAll("&amp;", "&"), baseUrl);
    if (url.origin !== baseOrigin) return;
    if (type !== "image" && !url.pathname.startsWith("/_next/static/")) return;
    // Responsive Next Image URLs depend on the user's viewport and DPR, so avoid
    // fetching an arbitrary srcset size as if it were a fixed initial resource.
    if (type === "image" && url.pathname.startsWith("/_next/image")) return;
    resources.set(url.href, { url: url.href, path: url.pathname, type });
  };

  for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
    const tag = match[0];
    if (/\bnomodule\b/i.test(tag)) continue;
    const src = readAttribute(tag, "src");
    if (src) addResource(src, "js");
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const href = readAttribute(tag, "href");
    if (!href) continue;
    if (readAttribute(tag, "as")?.toLowerCase() === "font") {
      addResource(href, "font");
    } else if (/\.css(?:\?|$)/i.test(href)) {
      addResource(href, "css");
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (readAttribute(tag, "loading")?.toLowerCase() === "lazy") continue;
    const src = readAttribute(tag, "src");
    if (src) addResource(src, "image");
  }

  const assets = await Promise.all(
    [...resources.values()].map(async (resource) => {
      try {
        const response = await fetch(resource.url, { signal: AbortSignal.timeout(30_000) });
        const body = await response.arrayBuffer();
        return {
          path: resource.path,
          type: resource.type,
          status: response.status,
          bytes: body.byteLength,
        };
      } catch (error) {
        return {
          path: resource.path,
          type: resource.type,
          status: "ERROR",
          bytes: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );

  return assets.sort((a, b) => b.bytes - a.bytes);
}

function formatMs(value) {
  return value == null ? "—" : `${Math.round(value)} ms`;
}

async function main() {
  const options = readOptions();
  const buildId = path.join(projectRoot, ".next", "BUILD_ID");
  if (!existsSync(buildId)) {
    throw new Error("Production build not found. Run `npm run build` first.");
  }
  if (!existsSync(nextCli)) {
    throw new Error("Next.js CLI is missing. Run `npm install` in jitu-frontend.");
  }

  const baseUrl = `http://127.0.0.1:${options.port}/`;
  const recentLogs = [];
  const server = spawn(
    process.execPath,
    [nextCli, "start", "-H", "127.0.0.1", "-p", String(options.port)],
    { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  const rememberLogs = (chunk) => {
    recentLogs.push(chunk.toString());
    if (recentLogs.length > 20) recentLogs.shift();
  };
  server.stdout.on("data", rememberLogs);
  server.stderr.on("data", rememberLogs);

  try {
    await waitForServer(server, baseUrl, recentLogs);
    for (let index = 0; index < 2; index += 1) await requestPage(baseUrl);

    const results = [];
    for (const concurrency of options.concurrency) {
      results.push(await runLoad(baseUrl, options.requests, concurrency));
    }

    const pageResponse = await fetch(baseUrl, { signal: AbortSignal.timeout(30_000) });
    const html = await pageResponse.text();
    const assets = await measureInitialAssets(html, baseUrl);
    const bytesFor = (type) =>
      assets
        .filter((asset) => asset.type === type && asset.status === 200)
        .reduce((total, asset) => total + asset.bytes, 0);
    const jsBytes = bytesFor("js");
    const cssBytes = bytesFor("css");
    const fontBytes = bytesFor("font");
    const eagerImageBytes = bytesFor("image");

    console.log("Jitu main page production benchmark");
    console.log(`Route: ${baseUrl}`);
    console.log(
      `Warm-up: 2 requests | Requests per concurrency level: ${options.requests}`,
    );
    console.log("");
    console.log(
      "Concurrency | Success | RPS | TTFB p50 / p95 | Response p50 / p95 | Avg HTML",
    );
    for (const result of results) {
      console.log(
        `${String(result.concurrency).padStart(11)} | ` +
          `${String(result.successful).padStart(7)}/${result.requests} | ` +
          `${result.requestsPerSecond.toFixed(1).padStart(5)} | ` +
          `${formatMs(result.ttfbP50Ms)} / ${formatMs(result.ttfbP95Ms)} | ` +
          `${formatMs(result.responseP50Ms)} / ${formatMs(result.responseP95Ms)} | ` +
          `${result.averageHtmlBytes == null ? "—" : `${Math.round(result.averageHtmlBytes / 1024)} KB`}`,
      );
    }
    console.log("");
    console.log(
      `Initial same-origin resources: ${assets.filter((asset) => asset.status === 200).length} files, ` +
        `${Math.round(jsBytes / 1024)} KB JS + ${Math.round(cssBytes / 1024)} KB CSS + ` +
        `${Math.round(fontBytes / 1024)} KB fonts + ${Math.round(eagerImageBytes / 1024)} KB direct eager images (decoded bytes)`,
    );
    for (const asset of assets.slice(0, 5)) {
      console.log(`  ${Math.round(asset.bytes / 1024)} KB ${asset.type.padEnd(5)} ${asset.path}`);
    }
    console.log(
      "\nLegacy nomodule scripts and responsive Next Image variants are excluded. This local HTTP run does not measure Core Web Vitals or real-user network conditions.",
    );

    if (results.some((result) => result.failed > 0) || assets.some((asset) => asset.status !== 200)) {
      process.exitCode = 1;
    }
  } finally {
    if (server.exitCode == null) server.kill();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
