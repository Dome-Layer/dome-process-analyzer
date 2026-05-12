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
# Pick a backend mode in .env.local — see below.
./node_modules/.bin/next dev
```

Runs on http://localhost:3000.

Two backend modes are supported:

- **Proxy mode** (matches production): leave `NEXT_PUBLIC_API_BASE` unset and set `BACKEND_PROXY_URL=http://localhost:8000`. The Next.js server rewrites `/api/*` requests to the backend. CSP stays at `connect-src 'self'`.
- **Direct mode** (dev convenience): set `NEXT_PUBLIC_API_BASE=http://localhost:8000`. The frontend calls the backend directly, bypassing the Next.js proxy. Useful when iterating on long requests — Next.js dev-server proxies time out around ~30s and the analysis endpoint can take ~40s.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main analyzer — submit process, view results |
| `/saved` | List saved analyses (auth required) |
| `/saved/[id]` | Read-only detail view for a saved analysis (auth required) |
| `/auth/callback` | Supabase magic link landing page |

## Environment Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `BACKEND_PROXY_URL` | Server | Yes (proxy mode) | URL the Next.js `/api/*` rewrite proxies to. Set to the Railway backend in production. |
| `NEXT_PUBLIC_API_BASE` | Client | No | Optional dev override — when set, the frontend calls this URL directly and the proxy is unused. Leave unset in production. |

## Deployment (Vercel)

Deployed on Vercel from the `frontend/` subdirectory. Runs in proxy mode: same-origin `/api/*` requests are proxied server-side to Railway.

**Required env vars in Vercel dashboard** (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `BACKEND_PROXY_URL` | `https://dome-process-analyzer-production.up.railway.app` |

`NEXT_PUBLIC_API_BASE` is intentionally **unset** in production. The Next.js rewrite plus same-origin `connect-src 'self'` is what keeps the CSP tight.

**Live URL**: https://analyzer.domelayer.com

## Auth Flow

1. User clicks Sign In → enters email → backend sends Supabase magic link
2. Magic link redirects to `https://analyzer.domelayer.com/auth/callback#access_token=...`
3. Callback page reads the token from the URL fragment and stores it in `localStorage` as `dome_access_token`
4. Subsequent API calls include `Authorization: Bearer <token>`

## Notes

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are **not** needed — the frontend has no Supabase JS client; all auth calls go through the backend.
- Sign-out (`DELETE /api/v1/auth/session`) goes through the same proxy route as every other API call — `lib/api.ts:deleteSession()` is the single helper. No separate `NEXT_PUBLIC_AUTH_BACKEND` variable.
- UptimeRobot (free tier) sends HEAD requests. The health endpoint on the backend explicitly handles both GET and HEAD.
- Railway redeploys (~2 min) will appear as brief outages in UptimeRobot — this is expected.
