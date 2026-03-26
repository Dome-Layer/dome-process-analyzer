# Dome Process Analyzer

Map, govern, and automate your business processes with AI.

Paste a plain-language process description and get back a structured analysis: process steps, systems inventory, governance flags, and automation opportunities — with a Mermaid flowchart.

## Live

- **App**: https://analyzer.domelayer.com
- **API**: https://dome-process-analyzer-production.up.railway.app

## Repo Structure

```
dome-process-analyzer/
├── backend/   # FastAPI (Python 3.12) — deployed on Railway
└── frontend/  # Next.js 14 App Router — deployed on Vercel
```

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

## Deployment

| Layer    | Platform | Config |
|----------|----------|--------|
| Frontend | Vercel   | Root dir: `frontend`, env vars set in dashboard |
| Backend  | Railway  | Root dir: `backend`, Dockerfile, env vars set in dashboard |

See `backend/README.md` and `frontend/README.md` for per-layer details.

## Stack

- **Backend**: FastAPI · Claude (Anthropic) · Supabase · structlog · Python 3.12
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS v3 · Mermaid
- **Auth**: Supabase magic links
- **Data**: Zero retention by default — analyses stored only on explicit user consent
