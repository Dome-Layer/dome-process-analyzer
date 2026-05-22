from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, Request

from app.core.db import get_db
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_current_user(request: Request) -> dict:
    """Dependency: extract and verify the Supabase auth token from the request.

    Returns a dict with 'user_id' and 'email'.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = auth_header.removeprefix("Bearer ").strip()
    supabase = get_db()

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")
        return {"user_id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
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
