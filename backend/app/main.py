from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analysis, auth
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="Dome Process Analyzer",
    description="Analyse business processes with AI-powered governance and automation insights.",
    version="1.0.0",
)

# CORS
origins = [o.strip() for o in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analysis.router)
app.include_router(auth.router)


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
