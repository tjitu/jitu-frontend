# Jitu main page performance check

This benchmark targets only the Jitu frontend home page at `/`. It starts a local **production** Next.js server on port `4173`, sends HTTP requests at several concurrency levels, measures the first-party JavaScript and CSS referenced by the page, then shuts the server down.

## Run it

From `new-repo/jitu-frontend`:

```powershell
npm run perf:main
```

That command builds the production app first. To rerun the benchmark against an existing build without rebuilding:

```powershell
npm run perf:main:run
```

The same scripts can also be run with pnpm if it is installed.

The build uses `next/font/google`, so it needs access to Google Fonts when the build cache does not already contain the fonts.

## Adjust the run

Defaults are 30 requests at each concurrency level: 1, 5, and 10. Override them in PowerShell before running:

```powershell
$env:PERF_REQUESTS = "50"
$env:PERF_CONCURRENCY = "1,5,10,20"
$env:PERF_PORT = "4174"
npm run perf:main
```

Clear overrides afterward if you want to return to defaults:

```powershell
Remove-Item Env:PERF_REQUESTS, Env:PERF_CONCURRENCY, Env:PERF_PORT -ErrorAction SilentlyContinue
```

The script also accepts `--requests`, `--concurrency`, and `--port` when called directly with Node.

## What it reports

- HTTP success count, requests per second, TTFB, and full-response p50/p95 for `/`.
- HTML response size and decoded byte sizes for initial same-origin JS, CSS, preloaded fonts, and directly referenced eager images. Legacy `nomodule` scripts are excluded because modern browsers skip them; responsive Next Image variants are excluded because the selected size depends on viewport and device pixel ratio.

The run is a local baseline. It does not measure LCP, CLS, interactions, CDN behavior, or real-user device/network performance. Compare results from the same machine and environment when evaluating changes.
