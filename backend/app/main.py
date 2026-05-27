from dome_core.middleware import RequestIDMiddleware, SecurityHeadersMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analysis
from app.core.config import settings
from app.core.limiter import RateLimitMiddleware
from app.core.logging import setup_logging
from app.core.sentry import init_sentry

init_sentry()
setup_logging()

app = FastAPI(
    title="Dome Process Analyzer",
    description="Analyse business processes with AI-powered governance and automation insights.",
    version="1.0.0",
)

origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware, environment=settings.environment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Session-Token"],
)
app.add_middleware(RequestIDMiddleware)

# Routers
app.include_router(analysis.router)


@app.api_route("/api/v1/health", methods=["GET", "HEAD"], tags=["health"])
async def health_check():
    supabase_status = "ok"
    try:
        from app.core.db import get_db

        get_db().table("saved_analyses").select("analysis_id").limit(1).execute()
    except Exception:
        supabase_status = "unavailable"
    return {"status": "ok", "supabase": supabase_status}
