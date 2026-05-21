import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response

from app.api.auth import get_current_user, get_current_user_optional
from app.core.cache import analysis_cache
from app.core.config import settings
from app.core.db import get_db
from app.core.limiter import check_rate_limit, get_client_ip
from app.core.logging import get_logger
from app.core.sse import sse_response
from app.models.schemas import (
    AnalysisDetailResponse,
    AnalysisListResponse,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisSummary,
    ErrorResponse,
    ProcessAnalysis,
    RefineRequest,
    RefineResponse,
    SaveRequest,
    SaveResponse,
)
from app.services.analysis import AnalysisService


def _parse_dt(value: str) -> datetime:
    """Parse an ISO datetime string from Supabase, tolerating non-standard
    fractional-second precision (e.g. 5 digits). Python 3.9 fromisoformat()
    requires exactly 0 or 6 fractional digits; pad/truncate to 6."""
    value = re.sub(
        r"\.(\d+)([+Z\-]|$)",
        lambda m: "." + m.group(1).ljust(6, "0")[:6] + m.group(2),
        value,
    )
    return datetime.fromisoformat(value)


logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


@router.post(
    "",
    response_model=AnalysisResponse,
    status_code=201,
    responses={
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def create_analysis(
    request: Request,
    response: Response,
    body: AnalysisRequest,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """Submit a process description for analysis.

    The endpoint accepts both anonymous and authenticated callers. A short
    burst limit (10/60s/IP) is applied by the rate-limit middleware to
    everyone; an additional cost-cap window (3/hr/IP anonymous, 30/hr/user
    authenticated) is enforced here so anonymous traffic cannot drain the
    Anthropic budget.
    """
    if user is not None:
        bucket_key = f"rl:hourly:user:{user['user_id']}:analysis"
        hourly_limit = settings.analysis_hourly_auth_limit
    else:
        bucket_key = f"rl:hourly:anon:{get_client_ip(request)}:analysis"
        hourly_limit = settings.analysis_hourly_anon_limit

    hourly_window = settings.analysis_hourly_window_seconds
    remaining, is_limited = check_rate_limit(bucket_key, hourly_limit, hourly_window)

    if is_limited:
        logger.info(
            "analysis_hourly_limit_exceeded",
            authenticated=user is not None,
            limit=hourly_limit,
        )
        raise HTTPException(
            status_code=429,
            detail="Hourly limit exceeded. Please try again later.",
            headers={
                "Retry-After": str(hourly_window),
                "X-RateLimit-Hourly-Limit": str(hourly_limit),
                "X-RateLimit-Hourly-Remaining": "0",
            },
        )

    response.headers["X-RateLimit-Hourly-Limit"] = str(hourly_limit)
    response.headers["X-RateLimit-Hourly-Remaining"] = str(remaining)

    service = AnalysisService()

    # SSE mode: keep the connection alive with heartbeat comments while the
    # LLM processes.  Prevents Vercel rewrite-proxy timeout (~120 s).
    accept = request.headers.get("accept", "")
    if "text/event-stream" in accept:
        return sse_response(
            service.run(body, user_id=user["user_id"] if user else None),
            extra_headers={
                "X-RateLimit-Hourly-Limit": str(hourly_limit),
                "X-RateLimit-Hourly-Remaining": str(remaining),
            },
        )

    return await service.run(body)


@router.post(
    "/{analysis_id}/refine",
    response_model=RefineResponse,
    responses={404: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def refine_analysis(
    request: Request,
    analysis_id: str,
    body: RefineRequest,
    x_session_token: Optional[str] = Header(None),
):
    """Refine an analysis by answering clarifying questions.

    Requires the session_token returned from the initial analysis (passed via
    X-Session-Token header).
    """
    if not x_session_token:
        raise HTTPException(status_code=401, detail="X-Session-Token header is required.")

    service = AnalysisService()

    accept = request.headers.get("accept", "")
    if "text/event-stream" in accept:
        return sse_response(service.refine(analysis_id, body, x_session_token))

    return await service.refine(analysis_id, body, x_session_token)


@router.get(
    "/{analysis_id}",
    response_model=AnalysisDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Retrieve a saved analysis by ID. Auth required."""
    result = (
        get_db()
        .table("saved_analyses")
        .select("*")
        .eq("analysis_id", analysis_id)
        .eq("user_id", user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    row = result.data[0]
    analysis = ProcessAnalysis.model_validate(row["analysis_json"])
    return AnalysisDetailResponse(
        analysis_id=analysis_id,
        saved=True,
        analysis=analysis,
        created_at=_parse_dt(row["created_at"]),
        updated_at=_parse_dt(row["saved_at"]),
    )


@router.post(
    "/{analysis_id}/save",
    response_model=SaveResponse,
    responses={404: {"model": ErrorResponse}, 400: {"model": ErrorResponse}},
)
async def save_analysis(
    analysis_id: str,
    body: SaveRequest,
    user: dict = Depends(get_current_user),
):
    """Save an analysis. Requires auth and explicit consent."""
    if not body.consent:
        raise HTTPException(status_code=400, detail="Consent is required to save an analysis.")

    cached = analysis_cache.get(analysis_id)
    if cached is None:
        raise HTTPException(status_code=404, detail="Analysis not found in cache.")

    analysis: ProcessAnalysis = cached["analysis"]
    now = datetime.now(timezone.utc)
    critical_flags = sum(1 for f in analysis.governance_flags if f.severity.value == "critical")

    row = {
        "analysis_id": analysis_id,
        "user_id": user["user_id"],
        "label": body.label,
        "process_name": analysis.process_name,
        "process_domain": analysis.process_domain,
        "overall_confidence": analysis.overall_confidence.value,
        "analysis_version": analysis.analysis_version,
        "total_steps": analysis.metrics.total_steps,
        "governance_flags_critical": critical_flags,
        "automation_opportunities": len(analysis.automation_opportunities),
        "analysis_json": analysis.model_dump(
            mode="json"
        ),  # stored as JSONB; never contains input text
        "created_at": analysis.created_at.isoformat(),
        "saved_at": now.isoformat(),
    }

    # Upsert so saving the same analysis_id twice (e.g. re-labelling) just updates.
    get_db().table("saved_analyses").upsert(row).execute()

    logger.info(
        "analysis_saved",
        analysis_id=analysis_id,
        user_id=user["user_id"],
        label=body.label,
    )

    return SaveResponse(analysis_id=analysis_id, saved=True, saved_at=now)


@router.get(
    "",
    response_model=AnalysisListResponse,
)
async def list_analyses(user: dict = Depends(get_current_user)):
    """List all saved analyses for the authenticated user."""
    result = (
        get_db()
        .table("saved_analyses")
        .select(
            "analysis_id,process_name,process_domain,overall_confidence,"
            "analysis_version,total_steps,governance_flags_critical,"
            "automation_opportunities,saved_at,label"
        )
        .eq("user_id", user["user_id"])
        .order("saved_at", desc=True)
        .execute()
    )

    summaries = [
        AnalysisSummary(
            analysis_id=row["analysis_id"],
            process_name=row["process_name"],
            process_domain=row["process_domain"],
            overall_confidence=row["overall_confidence"],
            analysis_version=row["analysis_version"],
            total_steps=row["total_steps"],
            governance_flags_critical=row["governance_flags_critical"],
            automation_opportunities=row["automation_opportunities"],
            saved_at=_parse_dt(row["saved_at"]),
            label=row.get("label"),
        )
        for row in result.data
    ]

    return AnalysisListResponse(analyses=summaries, total=len(summaries))


@router.delete(
    "/{analysis_id}",
    status_code=204,
    responses={404: {"model": ErrorResponse}},
)
async def delete_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a saved analysis. Auth required."""
    db = get_db()

    # Verify ownership before deleting.
    check = (
        db.table("saved_analyses")
        .select("analysis_id")
        .eq("analysis_id", analysis_id)
        .eq("user_id", user["user_id"])
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    db.table("saved_analyses").delete().eq("analysis_id", analysis_id).execute()
    analysis_cache.delete(analysis_id)

    logger.info("analysis_deleted", analysis_id=analysis_id, user_id=user["user_id"])
    return None
