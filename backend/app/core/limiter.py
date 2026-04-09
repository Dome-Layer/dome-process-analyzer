"""
In-memory sliding-window rate limiter middleware.

Runs as Starlette middleware so it intercepts every request before any route
handler — no decorator magic, no dependency on third-party libraries.
"""
import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# (method, path_exact_or_suffix): (max_requests, window_seconds)
_LIMITS: list[tuple[tuple[str, str], bool, int, int]] = [
    # (method, path), exact_match, limit, window_seconds
    (("POST", "/api/v1/analysis"),        True,  10, 60),   # 10/min on new analysis
    (("POST", "/refine"),                 False, 20, 60),   # 20/min on refine (suffix match)
    (("POST", "/api/v1/auth/magic-link"), True,  5,  60),   # 5/min on magic link requests
]


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # ip+path -> list of request timestamps in current window
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    async def dispatch(self, request: Request, call_next):
        limit, window = self._get_limit(request)
        if limit is not None:
            ip = _get_client_ip(request)
            bucket_key = f"{ip}:{request.url.path}"
            remaining, is_limited = self._check(bucket_key, limit, window)
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

    def _check(self, key: str, limit: int, window: int) -> tuple[int, bool]:
        """Returns (remaining, is_limited)."""
        now = time.time()
        cutoff = now - window
        with self._lock:
            self._buckets[key] = [t for t in self._buckets[key] if t > cutoff]
            count = len(self._buckets[key])
            if count >= limit:
                return 0, True
            self._buckets[key].append(now)
            return limit - count - 1, False
