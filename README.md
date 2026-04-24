# Dome Process Analyzer

Map, govern, and automate your business processes with AI.

Paste a plain-language process description and get back a structured analysis: process steps, systems inventory, governance flags, and automation opportunities — with a Mermaid flowchart.

Built by [Dome](https://www.domelayer.com) — the AI layer for governed operations.

## Live

- **App**: https://analyzer.domelayer.com
- **API**: https://dome-process-analyzer-production.up.railway.app

---

## What you get

Submit any business process in plain language and receive:

- **Process map** — each step sequenced, typed (manual / automated / decision / approval / external), with actor, duration, wait time, and bottleneck flags
- **Systems inventory** — every tool and platform mentioned or implied, with shadow IT detection
- **Governance flags** — segregation of duties gaps, missing audit trails, approval threshold issues, data handling risks, and regulatory exposure, each with severity (critical / major / minor)
- **Automation opportunities** — specific recommendations by type (RPA, API integration, workflow engine, AI extraction, LLM agent, rule engine) with implementation complexity and prerequisites
- **Metrics** — automation coverage %, bottleneck count, shadow IT flag, critical flag count
- **Mermaid flowchart** — auto-generated process diagram
- **Clarifying questions** — when the description is ambiguous, the tool surfaces the gaps and lets you refine the analysis

Analyses are anonymous by default. Sign in with a magic link to save results to your account.

---

## Repo Structure

```
dome-process-analyzer/
├── backend/   # FastAPI (Python 3.12) — deployed on Railway
└── frontend/  # Next.js 14 App Router — deployed on Vercel
```

---

## Local Development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY + Supabase credentials
python3 -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE=http://localhost:8000
./node_modules/.bin/next dev  # runs on port 3000
```

> **Note:** The frontend calls the backend directly (not via the Next.js proxy) because analysis takes ~40 seconds, which exceeds the proxy timeout. `NEXT_PUBLIC_API_BASE` must point at the backend URL.

### Dev Server Shortcuts (Claude Code)

Both server configurations are saved in `.claude/launch.json`. When working in Claude Code, use `preview_start` to launch either server without leaving the editor.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | Yes | `claude` \| `azure_openai` \| `ollama` — only `claude` is functional in v1 |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `AZURE_OPENAI_ENDPOINT` | No | Azure OpenAI endpoint (stubbed — not usable in v1) |
| `AZURE_OPENAI_KEY` | No | Azure OpenAI key (stubbed — not usable in v1) |
| `AZURE_OPENAI_DEPLOYMENT` | No | Azure OpenAI deployment name (stubbed) |
| `OLLAMA_URL` | No | Ollama base URL, default `http://localhost:11434` (stubbed — not usable in v1) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anon key (magic link emails) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key for backend DB access |
| `REDIS_URL` | No | Redis URL for rate limiter; falls back to in-memory if unset |
| `ENVIRONMENT` | Yes | `development` \| `production` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `SITE_URL` | Yes | Frontend URL — used in magic link email redirects |
| `CACHE_TTL_SECONDS` | No | In-memory analysis cache TTL, default `3600` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Direct backend URL (bypasses Next.js proxy) |
| `NEXT_PUBLIC_AUTH_BACKEND` | Backend auth endpoint |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL for magic link redirect |

---

## API Reference

All endpoints are prefixed `/api/v1`.

### Analysis

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/analysis` | None | Submit a process description; returns analysis + `session_token` |
| `POST` | `/analysis/{id}/refine` | `X-Session-Token` header | Answer clarifying questions; returns updated analysis |
| `GET` | `/analysis/{id}` | Bearer token | Retrieve a saved analysis |
| `POST` | `/analysis/{id}/save` | Bearer token | Save analysis (requires `consent: true` in body) |
| `GET` | `/analysis` | Bearer token | List saved analyses (paginated, default 20) |
| `DELETE` | `/analysis/{id}` | Bearer token | Delete a saved analysis |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/magic-link` | None | Send magic link email |
| `POST` | `/auth/verify` | None | Verify magic link token; returns `access_token` |
| `DELETE` | `/auth/session` | Bearer token | Logout |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` / `HEAD` | `/health` | Health check including Supabase status |

**Rate limits:** 10 req/60 s on `POST /analysis`, 20 req/60 s on `POST /analysis/{id}/refine`, 5 req/60 s on `POST /auth/magic-link` (per IP).

---

## Deployment

| Layer    | Platform | Config |
|----------|----------|--------|
| Frontend | Vercel   | Root dir: `frontend`, env vars set in dashboard |
| Backend  | Railway  | Root dir: `backend`, Dockerfile, env vars set in dashboard |

See `backend/README.md` for per-layer details.

### Supabase keep-alive

The Supabase free tier pauses after 7 days of inactivity. A Claude Code scheduled task (`supabase-keepalive`) pings the REST API every 4 days to prevent this. For production, add an UptimeRobot monitor on `/api/v1/health` so keep-alive runs independently of your local machine.

---

## Stack

- **Backend**: FastAPI · Claude (Anthropic) · Supabase · structlog · Python 3.12
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS v3 · Mermaid · DOMPurify
- **Auth**: Supabase magic links via Resend SMTP
- **Design**: DOME Design System v2.0 — Space Grotesk headings, JetBrains Mono labels, electric blue `#0080FF`
- **Data**: Zero retention by default — process descriptions are never persisted; analyses stored only on explicit user consent

---

## Data & Privacy

- Process descriptions are **never written to the database** — they exist only in a server-side in-memory cache with a 1-hour TTL, then are discarded.
- Saving an analysis requires explicit consent (`consent: true`). Only structured metadata and the analysis JSON are stored, never the original description.
- A SHA-256 hash of the input is logged in the governance event for audit purposes — not the content itself.
