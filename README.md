# Dome Process Analyzer

Map, govern, and automate your business processes with AI.

Paste a plain-language process description and get back a structured analysis: process steps, systems inventory, governance flags, and automation opportunities — with a Mermaid flowchart.

Built by [Dome](https://www.domelayer.com) — the AI layer for governed operations.

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

### Dev Server Shortcuts (Claude Code)

Both server configurations are saved in `.claude/launch.json`. When working in Claude Code, use `preview_start` to launch either server without leaving the editor.

## Deployment

| Layer    | Platform | Config |
|----------|----------|--------|
| Frontend | Vercel   | Root dir: `frontend`, env vars set in dashboard |
| Backend  | Railway  | Root dir: `backend`, Dockerfile, env vars set in dashboard |

See `backend/README.md` for per-layer details.

## Stack

- **Backend**: FastAPI · Claude (Anthropic) · Supabase · structlog · Python 3.12
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS v3 · Inter · Mermaid
- **Auth**: Supabase magic links
- **Design**: DOME Design System v2.0 — Inter typeface, electric blue `#0080FF`, flat neutrals
- **Data**: Zero retention by default — analyses stored only on explicit user consent
