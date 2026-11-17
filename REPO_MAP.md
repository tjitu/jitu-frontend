# JITU FRONTEND REPOSITORY MAP

> Quick reference for LLM agents. Consult before reading component files. This file is mutable — update it when adding routes, modules, or shared UI systems.

---

## 1. Directory Structure

```
jitu-frontend/
├── app/                         # Next.js 16 App Router (port 5173)
│   ├── (auth)/                  # Auth flows (/forgot-password, /reset-password; /login, /register at root)
│   ├── (main)/                  # Student-facing pages (/dashboard, /tryout, /latihan, /daily-streak, /arsip-soal, /soal-asli, /shop, /profile, /referral, /sandbox)
│   ├── (admin)/admin/           # Admin views (/admin/tryout, /admin/create-to, /admin/daily, /admin/ai-generator, /admin/packages, /admin/payments, /admin/user, /admin/hiring)
│   ├── blog/, careers/, hiring/, open-hiring/ # Public editorial & hiring routes
│   ├── api/                     # Route handlers & proxies (/api/proxy/*, /api/analytics/*, /api/catalog/*, /api/practice/*, /api/soal-asli/*, /api/hiring/*)
│   ├── layout.tsx               # Root layout (fonts, providers, Sonner toaster)
│   └── globals.css              # Tailwind v4 @theme inline tokens, semantic variables, KaTeX styles
├── modules/                     # Feature-sliced page modules (see modules/AGENTS.md)
│   ├── LandingPageModule/       # Public landing & marketing sections
│   ├── LoginModule/, RegisterModule/ # Auth screens
│   ├── DashboardModule/         # Student dashboard, tryout cards, stats, milestone
│   ├── TryoutModule/, TryoutDetailModule/, TryoutLeaderboardModule/ # Catalog, registration, ranking
│   ├── TryoutExamModule/, SubtestQuestionsModule/ # Active exam runner, timer, question viewer
│   ├── HistoryModule/           # Past tryout attempts & IRT score review
│   ├── LatihanModule/, DailyStreakModule/ # Daily practice & streak drills
│   ├── ShopModule/, PendingTransactionsModule/, PastTransactionsModule/ # Coin packages & Midtrans checkout
│   ├── ProfileModule/, ReferralModule/, HiringModule/ # Settings, PTN targets, referrals, careers
│   └── Admin*Module/, CreateTryoutModule/, EditTryoutModule/ # Admin tryout, AI generator, daily, packages, payments, users, hiring
├── components/                  # Reusable UI components
│   ├── ui/                      # Core primitives (Button, Card, Dialog, Table, Tabs, Sheet, RichTextEditor, pixel icons, etc.)
│   ├── elements/                # Domain components (Navbar, BottomNav, AdminNavbar, StatCard, Leaderboard)
│   ├── ptn/                     # PTN/Prodi/School pickers
│   └── payment/                 # SnapQRIS & payment dialogs
├── lib/                         # Utilities, auth client, API helpers (`auth-client.ts`, `utils.ts`, etc.)
├── design.md                    # Visual language, tokens & per-element guardrails
├── writing.md                   # Student-facing voice, copy deck & microcopy rules
├── PERFORMANCE.md               # Local production benchmark for `/`
└── docs/                        # Auth & deployment guides (`firebase-auth.md`, `production-vercel.md`)
```

---

## 2. Key Routing & Architecture Patterns

* **Proxied Backend Requests**: Requests to `/api/proxy/*` are handled first by local Next.js route handlers (such as `/api/proxy/tryout`, `/api/proxy/tryout/[id]`, `/api/proxy/tryout/[id]/leaderboard`, `/api/proxy/tryout/[id]/register`, `/api/proxy/tryout/[id]/unlock`, `/api/proxy/dashboard/*`, `/api/proxy/profile/*`, `/api/proxy/shop/*`, `/api/proxy/auth/*`) and fall back to `http://localhost:3000` via `next.config.ts` rewrites.
* **Styling & Design**: Tailwind CSS v4 (`@theme inline` in `app/globals.css`) wired to semantic variables defined in [design.md](file:///C:/JITU-ECOSYSTEM/jitu-frontend/design.md). Copy follows [writing.md](file:///C:/JITU-ECOSYSTEM/jitu-frontend/writing.md).
* **State & Data Fetching**: React Server Components where possible; client components use `fetch` or hooks for dynamic polling.
