# Dome Process Analyzer — Frontend

Next.js 14 App Router frontend for the Dome Process Analyzer.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v3
- Mermaid (flowchart rendering)
- Supabase (auth, via backend)

## Local Development

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE=http://localhost:8000 in .env.local
./node_modules/.bin/next dev
```

Runs on http://localhost:3000.

> **Note**: Use `NEXT_PUBLIC_API_BASE=http://localhost:8000` to call the backend directly.
> Do not proxy through Next.js — the backend analysis endpoint takes ~40s and Next.js has a ~30s proxy timeout.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main analyzer — submit process, view results |
| `/saved` | List saved analyses (auth required) |
| `/saved/[id]` | Read-only detail view for a saved analysis (auth required) |
| `/auth/callback` | Supabase magic link landing page |
| `/unlock` | Passphrase gate (if `SITE_PASSPHRASE` is set) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Yes | Backend base URL (no trailing slash) |
| `SITE_PASSPHRASE` | No | If set, gates the app behind a passphrase |

## Deployment (Vercel)

Deployed on Vercel from the `frontend/` subdirectory.

**Required env vars in Vercel dashboard** (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE` | `https://dome-process-analyzer-production.up.railway.app` |
| `SITE_PASSPHRASE` | Your chosen passphrase |

**Live URL**: https://analyzer.domelayer.com

## Auth Flow

1. User clicks Sign In → enters email → backend sends Supabase magic link
2. Magic link redirects to `https://analyzer.domelayer.com/auth/callback#access_token=...`
3. Callback page reads the token from the URL fragment and stores it in `localStorage` as `dome_access_token`
4. Subsequent API calls include `Authorization: Bearer <token>`

## Notes

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are **not** needed — the frontend has no Supabase JS client; all auth calls go through the backend.
- UptimeRobot (free tier) sends HEAD requests. The health endpoint on the backend explicitly handles both GET and HEAD.
- Railway redeploys (~2 min) will appear as brief outages in UptimeRobot — this is expected.
