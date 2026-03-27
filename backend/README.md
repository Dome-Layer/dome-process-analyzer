# Dome Process Analyzer — Backend

A FastAPI backend that accepts plain-language business process descriptions, analyses them with Claude, and returns structured JSON including a process map, systems inventory, governance flags, and automation opportunities.

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY and Supabase credentials

# 4. Run the server
python3 -m uvicorn app.main:app --reload --port 8000
```

## Docker

```bash
docker build -t dome-process-analyzer .
docker run -p 8000:8000 --env-file .env dome-process-analyzer
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/analysis` | No | Submit a process description for analysis |
| `POST` | `/api/v1/analysis/{id}/refine` | Session token | Refine analysis with clarification answers |
| `GET` | `/api/v1/analysis/{id}` | Yes | Retrieve a saved analysis |
| `POST` | `/api/v1/analysis/{id}/save` | Yes | Save an analysis (requires consent) |
| `GET` | `/api/v1/analysis` | Yes | List saved analyses |
| `DELETE` | `/api/v1/analysis/{id}` | Yes | Delete a saved analysis |
| `POST` | `/api/v1/auth/magic-link` | No | Request a magic link email |
| `POST` | `/api/v1/auth/verify` | No | Verify a magic link token |
| `DELETE` | `/api/v1/auth/session` | Yes | Logout |
| `GET`/`HEAD` | `/api/v1/health` | No | Health check (HEAD supported for UptimeRobot) |

## Architecture

- **LLM Abstraction**: All LLM calls go through `LLMProvider` ABC. Provider selected via `LLM_PROVIDER` env var.
- **Zero Data Retention**: Process descriptions are never persisted. Unsaved analyses live in an in-memory TTL cache (1 hour). Full data is only stored on explicit user save with consent.
- **Anonymous Use**: Initial analysis requires no authentication. A session token is issued for subsequent refinement. Saving requires Supabase auth.
- **Governance Events**: Every analysis emits a `GovernanceEvent` logging metadata (never content).
- **Structured Logging**: JSON logs in production, pretty-printed in development via `structlog`.

## Testing

```bash
pip install pytest httpx
pytest tests/
```

## Environment Variables

See `.env.example` for all configuration options.

## Deployment (Railway)

The backend is deployed on Railway from the `backend/` subdirectory.

**Required env vars in Railway dashboard:**

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | `https://analyzer.domelayer.com` |
| `SITE_URL` | `https://analyzer.domelayer.com` |
| `PORT` | `8000` |

**Live URL**: https://dome-process-analyzer-production.up.railway.app

## Supabase Auth Configuration

Magic link emails are routed through a custom SMTP provider (Resend) instead of Supabase's shared SMTP. This removes the 4 emails/hour project-wide limit imposed by the free tier.

**Supabase dashboard → Settings → Authentication → SMTP Settings:**

| Setting | Value |
|---------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API key |
| Sender email | `noreply@domelayer.com` |
| Sender name | `Dome Process Analyzer` |

The `domelayer.com` domain is already verified in Resend. Remaining limit: Resend free tier — 100 emails/day, 3,000/month.
