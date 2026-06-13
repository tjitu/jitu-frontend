# Frontend Production: Vercel Pro

Target production shape:

- Frontend: Vercel Pro
- Backend API: GCP Cloud Run
- Database: Supabase, used by backend services
- Assets: Cloudinary, rendered by frontend from backend/AI service payloads

## Required Vercel Environment

Use `.env.production.example` as the Vercel env checklist:

- `NEXT_PUBLIC_FRONTEND_URL=https://YOUR_VERCEL_DOMAIN`
- `NEXT_PUBLIC_BACKEND_URL=https://YOUR_BACKEND_CLOUD_RUN_URL`

The app uses Next rewrites:

- `/api/auth/:path*` -> `${NEXT_PUBLIC_BACKEND_URL}/api/auth/:path*`
- `/api/proxy/:path*` -> `${NEXT_PUBLIC_BACKEND_URL}/:path*`

That means browser requests stay same-origin on Vercel while the rewrite forwards to the backend.

## Vercel Settings

- Framework preset: Next.js
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output: Vercel default for Next.js

After backend deploy, set the Vercel production env and redeploy.

## Backend CORS Pairing

The backend Cloud Run env must include the Vercel domain:

- `FRONTEND_URL=https://YOUR_VERCEL_DOMAIN`
- `ALLOWED_ORIGINS=https://YOUR_VERCEL_DOMAIN`
- `TRUSTED_ORIGINS=https://YOUR_VERCEL_DOMAIN`

Use the exact Vercel production URL, then add custom domain later if needed.
