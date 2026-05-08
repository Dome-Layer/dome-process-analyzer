from __future__ import annotations

import threading
import time
from typing import Any, Optional

from app.core.config import settings


class TTLCache:
    """Thread-safe in-memory cache with per-entry TTL expiration."""

    def __init__(self, default_ttl: int | None = None):
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl or settings.cache_ttl_seconds

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        expires_at = time.time() + (ttl or self._default_ttl)
        with self._lock:
            self._store[key] = (value, expires_at)

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.time() > expires_at:
                del self._store[key]
                return None
            return value

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

    def cleanup(self) -> int:
        """Remove all expired entries. Returns count of removed entries."""
        now = time.time()
        removed = 0
        with self._lock:
            expired_keys = [k for k, (_, exp) in self._store.items() if now > exp]
            for k in expired_keys:
                del self._store[k]
                removed += 1
        return removed


# Singleton cache instance
analysis_cache = TTLCache()
