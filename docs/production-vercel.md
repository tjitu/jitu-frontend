# Frontend Production: Vercel Pro

Target production shape:

- Frontend: Vercel Pro
- Backend API: GCP Cloud Run
- Database: Supabase, used by backend services
- Assets: Cloudinary, rendered by frontend from backend/AI service payloads

## Required Vercel Environment

Use `.env.example` and `docs/firebase-auth.md` as the Vercel env checklist:

- `NEXT_PUBLIC_FRONTEND_URL=https://YOUR_VERCEL_DOMAIN`
- `NEXT_PUBLIC_BACKEND_URL=https://YOUR_BACKEND_CLOUD_RUN_URL`
- `ARTICLES_API_URL=https://YOUR_TEAM_BACKEND_VERCEL_DOMAIN/api`
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` from `firebase apps:sdkconfig WEB`

The app uses Next rewrites:

- `/api/proxy/:path*` -> `${NEXT_PUBLIC_BACKEND_URL}/:path*`

That means browser requests stay same-origin on Vercel while the rewrite forwards to the backend.

## Vercel Settings

- Framework preset: Next.js
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output: Vercel default for Next.js

After backend deploy, set the Vercel production env and redeploy.

## GitHub Deploy

Required GitHub repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Required Vercel production environment variables:

```text
NEXT_PUBLIC_FRONTEND_URL=https://YOUR_VERCEL_DOMAIN
NEXT_PUBLIC_BACKEND_URL=https://YOUR_BACKEND_CLOUD_RUN_URL
FRONTEND_URL=https://YOUR_VERCEL_DOMAIN
BACKEND_URL=https://YOUR_BACKEND_CLOUD_RUN_URL
```

After the Vercel project is linked and production env is set, run:

```text
GitHub Actions -> Deploy Frontend to Vercel -> Run workflow
```

The workflow typechecks the Next app, pulls Vercel production settings, builds with Vercel CLI, and deploys the prebuilt production output.

## Backend CORS Pairing

The backend Cloud Run env must include the Vercel domain for CORS if the frontend ever calls it directly:

- `FRONTEND_URL=https://YOUR_VERCEL_DOMAIN`
- `ALLOWED_ORIGINS=https://YOUR_VERCEL_DOMAIN`

Firebase Authentication authorized domains must include the deployed frontend host(s), including the Jitu custom domain.
