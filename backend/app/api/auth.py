from __future__ import annotations

from typing import Optional

from dome_core.auth import AuthError, Principal, make_supabase_fallback, verify_jwt
from fastapi import HTTPException, Request

from app.core.config import settings
from app.core.db import get_db
from app.core.logging import get_logger

logger = get_logger(__name__)


def _supabase_for_fallback():
    """Return a Supabase client for the network fallback, or None if auth is
    not configured (dev). ``get_db`` raises when unset, so guard on settings."""
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    return get_db()


# Validates a token via the legacy supabase.auth.get_user round-trip; used only
# when local JWKS verification can't reach a signing key (DA-005 resilience).
_network_fallback = make_supabase_fallback(_supabase_for_fallback)


def get_current_user(request: Request) -> dict:
    """Dependency: extract and verify the Supabase auth token from the request.

    Verifies the JWT signature locally against Supabase's published JWKS
    (dome-core ``verify_jwt``), falling back to a live ``get_user`` call only on
    JWKS-infrastructure failure. Returns a dict with 'user_id' and 'email'.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = auth_header.removeprefix("Bearer ").strip()
    try:
        principal: Principal = verify_jwt(
            token,
            supabase_url=settings.supabase_url,
            network_fallback=_network_fallback,
        )
        return {"user_id": principal.user_id, "email": principal.email}
    except AuthError as e:
        logger.warning("auth_verification_failed", error=str(e))
        raise HTTPException(status_code=401, detail="Invalid or expired token.")


def get_current_user_optional(request: Request) -> Optional[dict]:
    """Dependency for endpoints with opt-in auth (e.g. the public-demo
    analysis route).

    Contract:
      * Missing or non-bearer Authorization header → returns ``None``
        (caller treats the request as anonymous).
      * Bearer token present but invalid/expired → raises ``HTTPException(401)``
        (we do **not** silently demote stale-token requests to the anonymous
        bucket — that produces a confusing UX where a signed-in user with an
        expired token quietly hits the 3/hr/IP cap and cannot tell why).
      * Valid token → returns ``{"user_id", "email"}`` identical to
        :func:`get_current_user`.

    Do **not** swap this in for :func:`get_current_user` on routes that
    require authentication — the missing-header branch returns ``None`` and
    would silently bypass auth.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return get_current_user(request)
