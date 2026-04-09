"""
Sliding-window rate limiter middleware.

Uses Redis when REDIS_URL is configured (shared across all instances),
falls back to in-memory when Redis is not available (single-instance only).
"""
import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)

# (method, path, exact_match): (limit, window_seconds)
_LIMITS: list[tuple[tuple[str, str], bool, int, int]] = [
    (("POST", "/api/v1/analysis"),        True,  10, 60),
    (("POST", "/refine"),                 False, 20, 60),
    (("POST", "/api/v1/auth/magic-link"), True,   5, 60),
]


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class _RedisStore:
    """Sliding-window counter backed by Redis sorted sets."""

    def __init__(self, redis_url: str):
        import redis as redis_lib
        self._r = redis_lib.from_url(redis_url, decode_responses=True)

    def check(self, key: str, limit: int, window: int) -> tuple[int, bool]:
        now = time.time()
        cutoff = now - window
        pipe = self._r.pipeline()
        pipe.zremrangebyscore(key, "-inf", cutoff)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window + 1)
        results = pipe.execute()
        count = results[2]  # zcard result
        if count > limit:
            # Remove the entry we just added — request is rejected
            self._r.zrem(key, str(now))
            return 0, True
        return max(limit - count, 0), False


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


def _build_store():
    from app.core.config import settings
    if settings.redis_url:
        try:
            store = _RedisStore(settings.redis_url)
            store._r.ping()
            logger.info("rate_limiter_backend", backend="redis")
            return store
        except Exception as e:
            logger.warning("rate_limiter_redis_unavailable", error=str(e))
    logger.info("rate_limiter_backend", backend="memory")
    return _MemoryStore()


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._store = _build_store()

    async def dispatch(self, request: Request, call_next):
        limit, window = self._get_limit(request)
        if limit is not None:
            ip = _get_client_ip(request)
            bucket_key = f"rl:{ip}:{request.url.path}"
            remaining, is_limited = self._store.check(bucket_key, limit, window)
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
