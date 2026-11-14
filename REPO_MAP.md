# JITU FRONTEND REPOSITORY MAP

> Quick reference for LLM agents. Consult before reading component files.

---

## 1. Directory Structure

```
jitu-frontend/
├── app/                  # Next.js 16 App Router
│   ├── (auth)/           # /login, /register routes
│   ├── (main)/           # Student-facing pages (dashboard, tryout, latihan, shop)
│   ├── (admin)/          # Admin operational views
│   ├── api/              # API routes & backend proxies (/api/proxy/*, /api/analytics/*)
│   ├── layout.tsx        # Root layout (fonts, providers, Sonner toaster)
│   └── globals.css       # Tailwind v4 theme, color primitives, KaTeX styles
├── modules/              # Feature modules (Business logic & page views)
│   ├── DashboardModule/  # Student dashboard, tryout cards, stats, milestone
│   ├── TryoutModule/     # Tryout catalog list (/tryout)
│   ├── TryoutDetailModule/ # Tryout detail & registration page
│   ├── TryoutExamModule/ # Active exam runner, timer, question viewer
│   ├── LatihanModule/    # Daily practice & drill questions
│   ├── ShopModule/       # Coin purchase, packages, Midtrans checkout
│   ├── ProfileModule/    # User settings, target PTN & jurusan
│   └── ...
├── components/           # Reusable UI components
│   ├── ui/               # Core atomic primitives (Button, Dialog, Dropdown, Sonner)
│   ├── elements/         # Domain-specific components
│   └── payment/          # Payment dialogs & QRIS modal
├── lib/                  # Utilities, auth client, API helpers
│   ├── auth-client.ts    # Better Auth client configuration
│   └── utils.ts          # cn() and string formatters
```

---

## 2. Key Routing & Architecture Patterns

* **Proxied Backend Requests**: Requests to `/api/proxy/*` are forwarded to `http://localhost:3000` to avoid CORS issues and share cookie headers.
* **Styling**: Tailwind CSS v4 using semantic theme variables (`--color-bg`, `--color-surface`, `--color-primary`, `--blue-500`, etc.).
* **State & Data Fetching**: React Server Components where possible, client components use standard `fetch` or SWR/hooks for dynamic polling.
