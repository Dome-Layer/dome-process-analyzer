from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

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

# CORS
origins = [o.strip() for o in settings.allowed_origins.split(",")]


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.environment in ("staging", "production"):
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response


# Middleware is applied in reverse registration order (last added = outermost).
# CORSMiddleware must be outermost so CORS headers are present on ALL responses,
# including 429s returned by RateLimitMiddleware before reaching the route.
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Session-Token"],
)

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
