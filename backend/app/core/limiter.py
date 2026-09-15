"""
Sliding-window rate limiter.

Two consumers share one store:

1. ``RateLimitMiddleware`` — applies short burst limits per (method, path)
   bucketed by client IP. Configured via ``_LIMITS`` below.

2. Route handlers — call :func:`check_rate_limit` directly when they need
   auth-aware buckets (e.g. anonymous-IP vs authenticated-user hourly caps).
   The shared singleton is exposed via :func:`get_store`.

The store is in-process memory, so limits are per replica and reset on every
redeploy. The backend runs a single replica; a shared store was removed as
unneeded (DOME_DECISIONS 2026-09-15). Revisit before scaling out. Checks fail
open on unexpected errors so the limiter cannot take the analysis endpoint down.
"""

import time
from collections import defaultdict
from threading import Lock
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)

# (method, path, exact_match): (limit, window_seconds)
_LIMITS: list[tuple[tuple[str, str], bool, int, int]] = [
    (("POST", "/api/v1/analysis"), True, 10, 60),
    (("POST", "/refine"), False, 20, 60),
]


def get_client_ip(request: Request) -> str:
    """Extract the client IP from X-Forwarded-For or fall back to peer address."""
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class _MemoryStore:
    """Sliding-window counter backed by in-process memory."""

    def __init__(self):
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def check(self, key: str, limit: int, window: int) -> tuple[int, bool]:
        now = time.time()
        cutoff = now - window
        with self._lock:
            self._buckets[key] = [t for t in self._buckets[key] if t > cutoff]
            count = len(self._buckets[key])
            if count >= limit:
                return 0, True
            self._buckets[key].append(now)
            return limit - count - 1, False


# Module-level singleton, lazily initialised. Tests monkey-patch this directly
# to reset state between cases.
_cached_store: Optional[_MemoryStore] = None


def get_store() -> _MemoryStore:
    """Return the shared rate-limit store, initialising it on first call."""
    global _cached_store
    if _cached_store is None:
        _cached_store = _MemoryStore()
    return _cached_store


def check_rate_limit(key: str, limit: int, window: int) -> tuple[int, bool]:
    """Check ``key`` against ``limit`` within ``window`` seconds.

    Returns ``(remaining, is_limited)``. Fails open on store errors.
    """
    try:
        return get_store().check(key, limit, window)
    except Exception as e:
        logger.warning("rate_limiter_check_failed", key=key, error=str(e))
        return limit, False


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Burst-limit middleware. Reads the shared store via ``get_store()``."""

    async def dispatch(self, request: Request, call_next):
        limit, window = self._get_limit(request)
        if limit is not None:
            ip = get_client_ip(request)
            bucket_key = f"rl:{ip}:{request.url.path}"
            remaining, is_limited = check_rate_limit(bucket_key, limit, window)
            if is_limited:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."},
                    headers={
                        "Retry-After": str(window),
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                    },
                )
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response
        return await call_next(request)

    def _get_limit(self, request: Request):
        method = request.method
        path = request.url.path
        for (m, p), exact, limit, window in _LIMITS:
            if method != m:
                continue
            if exact and path == p:
                return limit, window
            if not exact and path.endswith(p):
                return limit, window
        return None, None
