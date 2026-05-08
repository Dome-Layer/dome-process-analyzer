"""Basic endpoint smoke tests for the Dome Process Analyzer API."""

from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.auth import get_current_user_optional
from app.core import limiter
from app.main import app
from app.models.schemas import ProcessAnalysis

client = TestClient(app)


# -- Rate-limit isolation -----------------------------------------------------


@pytest.fixture(autouse=True)
def _isolated_rate_limit_store(monkeypatch):
    """Reset the shared rate-limit store to a fresh in-memory instance per test
    so that bucket state from one test never bleeds into the next.

    The route handler and middleware both call ``limiter.get_store()`` which
    reads from the module-level ``_cached_store`` singleton. Replacing that
    singleton is sufficient for full isolation.
    """
    monkeypatch.setattr(limiter, "_cached_store", limiter._MemoryStore())
    yield


@pytest.fixture
def _override_optional_auth_as_user():
    """Force ``get_current_user_optional`` to return a fixed authenticated user
    for the duration of a test, bypassing the Supabase round-trip."""
    fake_user = {"user_id": "test-user-id", "email": "test@example.com"}
    app.dependency_overrides[get_current_user_optional] = lambda: fake_user
    yield fake_user
    app.dependency_overrides.pop(get_current_user_optional, None)


# -- Fixtures / Helpers -------------------------------------------------------


def _make_fake_analysis(analysis_id: str = "test-id") -> dict:
    """Return a minimal valid ProcessAnalysis dict for testing."""
    return {
        "analysis_id": analysis_id,
        "process_name": "Test Process",
        "process_domain": "testing",
        "process_owner_role": "Tester",
        "description_summary": "A test process for smoke testing the API.",
        "steps": [
            {
                "id": "step_1",
                "sequence": 1,
                "name": "Submit request",
                "description": "User submits a request",
                "step_type": "manual",
                "actor": "Requester",
                "systems_involved": ["email"],
                "duration_estimate_minutes": 5,
                "wait_time_minutes": None,
                "is_bottleneck": False,
                "confidence": "high",
            }
        ],
        "systems": [
            {
                "id": "sys_1",
                "name": "Email",
                "system_type": "email",
                "vendor": None,
                "is_shadow_it": True,
                "integration_notes": None,
            }
        ],
        "integrations": [],
        "governance_flags": [
            {
                "id": "gov_1",
                "severity": "minor",
                "category": "shadow_it",
                "title": "Shadow IT usage",
                "description": "Email used as a process tool.",
                "affected_steps": ["step_1"],
                "recommendation": "Replace with a proper ticketing system.",
                "regulatory_reference": None,
            }
        ],
        "automation_opportunities": [
            {
                "id": "auto_1",
                "title": "Automate request intake",
                "description": "Use a form instead of email.",
                "affected_steps": ["step_1"],
                "automation_potential": "high",
                "automation_type": "workflow_engine",
                "estimated_time_saving_minutes_per_instance": 3,
                "implementation_complexity": "low",
                "prerequisites": ["Web form tool"],
            }
        ],
        "mermaid_flowchart": "flowchart TD\n  step_1[Submit request]",
        "metrics": {
            "total_steps": 1,
            "manual_steps": 1,
            "automated_steps": 0,
            "decision_points": 0,
            "estimated_total_duration_minutes": 5,
            "estimated_wait_time_minutes": 0,
            "estimated_active_work_minutes": 5,
            "systems_count": 1,
            "shadow_it_detected": True,
            "automation_coverage_percent": 0.0,
        },
        "clarifying_questions": [],
        "overall_confidence": "high",
        "analysis_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# -- Health Check -------------------------------------------------------------


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["supabase"] in ("ok", "unavailable")


# -- POST /api/v1/analysis ---------------------------------------------------


def test_create_analysis_validation_error():
    """Description too short should return 422."""
    response = client.post(
        "/api/v1/analysis",
        json={"description": "Too short"},
    )
    assert response.status_code == 422


@patch("app.services.analysis.AnalysisService.run")
def test_create_analysis_success(mock_run):
    """Successful analysis should return 201 with analysis data."""
    fake_analysis_dict = _make_fake_analysis()
    fake_analysis = ProcessAnalysis.model_validate(fake_analysis_dict)

    from app.models.schemas import AnalysisResponse, AnalysisStatus

    mock_run.return_value = AnalysisResponse(
        analysis_id="test-id",
        status=AnalysisStatus.complete,
        analysis=fake_analysis,
        session_token="test-session-token",
    )

    response = client.post(
        "/api/v1/analysis",
        json={
            "description": "A " * 30
            + "business process that involves multiple steps and systems for testing purposes.",
            "process_name": "Test Process",
            "domain_hint": "testing",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["analysis_id"] == "test-id"
    assert data["status"] == "complete"
    assert data["session_token"] == "test-session-token"
    assert data["analysis"]["process_name"] == "Test Process"


# -- GET /api/v1/analysis/{id} (without auth) --------------------------------


def test_get_analysis_no_auth():
    """Accessing a saved analysis without auth should return 401."""
    response = client.get("/api/v1/analysis/some-id")
    assert response.status_code == 401


# -- GET /api/v1/analysis (list, without auth) --------------------------------


def test_list_analyses_no_auth():
    """Listing analyses without auth should return 401."""
    response = client.get("/api/v1/analysis")
    assert response.status_code == 401


# -- POST /api/v1/analysis/{id}/refine (without session token) ----------------


def test_refine_analysis_no_session_token():
    """Refining without X-Session-Token should return 401."""
    response = client.post(
        "/api/v1/analysis/some-id/refine",
        json={"answers": [{"question_id": "q1", "answer": "test answer"}]},
    )
    assert response.status_code == 401


# -- DELETE /api/v1/analysis/{id} (without auth) -----------------------------


def test_delete_analysis_no_auth():
    """Deleting without auth should return 401."""
    response = client.delete("/api/v1/analysis/some-id")
    assert response.status_code == 401


# -- POST /api/v1/auth/magic-link -------------------------------------------


def test_magic_link_invalid_email():
    """Invalid email format should return 422."""
    response = client.post(
        "/api/v1/auth/magic-link",
        json={"email": "not-an-email"},
    )
    assert response.status_code == 422


# -- POST /api/v1/auth/verify -----------------------------------------------


def test_verify_missing_token():
    """Missing token field should return 422."""
    response = client.post(
        "/api/v1/auth/verify",
        json={},
    )
    assert response.status_code == 422


# -- Rate limiting on /api/v1/analysis ---------------------------------------


def _analysis_payload() -> dict:
    """Return a minimum-valid analysis request body (>= 400 chars)."""
    return {
        "description": "A " * 30
        + "business process that involves multiple steps and systems for testing rate-limit behaviour. "
        * 4,
        "process_name": "Rate-limit test",
        "domain_hint": "testing",
    }


def _success_mock():
    """Build the AnalysisResponse object that AnalysisService.run is patched to return."""
    fake_analysis = ProcessAnalysis.model_validate(_make_fake_analysis())
    from app.models.schemas import AnalysisResponse, AnalysisStatus

    return AnalysisResponse(
        analysis_id="rl-test",
        status=AnalysisStatus.complete,
        analysis=fake_analysis,
        session_token="rl-test-token",
    )


@patch("app.services.analysis.AnalysisService.run")
def test_create_analysis_anonymous_hourly_cap(mock_run):
    """Anonymous IP gets 3 successful POSTs/hour, then 429."""
    mock_run.return_value = _success_mock()
    headers = {"X-Forwarded-For": "9.9.9.9"}

    for i in range(3):
        r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
        assert r.status_code == 201, f"Request {i + 1} unexpectedly rejected"
        assert r.headers["X-RateLimit-Hourly-Limit"] == "3"

    r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
    assert r.status_code == 429
    assert r.headers["X-RateLimit-Hourly-Limit"] == "3"
    assert r.headers["X-RateLimit-Hourly-Remaining"] == "0"
    assert r.headers["Retry-After"] == "3600"
    assert "Hourly limit exceeded" in r.json()["detail"]


@patch("app.services.analysis.AnalysisService.run")
def test_create_analysis_authenticated_higher_cap(mock_run, _override_optional_auth_as_user):
    """Authenticated users get 30/hour; the 31st request is 429."""
    mock_run.return_value = _success_mock()
    headers = {"X-Forwarded-For": "8.8.8.8", "Authorization": "Bearer test-token"}

    for i in range(30):
        r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
        # Some of the first 10 requests will pass burst; later ones are blocked
        # by the burst limit (10/60s) before they reach the hourly check. Use
        # unique IPs per request so only the user-keyed hourly bucket fills.
        # We still need to bypass the burst limit, so spoof a unique IP each call.
        headers["X-Forwarded-For"] = f"10.0.0.{i + 1}"
        assert r.status_code == 201, f"Request {i + 1} unexpectedly rejected ({r.status_code})"
        assert r.headers["X-RateLimit-Hourly-Limit"] == "30"

    r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
    assert r.status_code == 429
    assert r.headers["X-RateLimit-Hourly-Limit"] == "30"
    assert r.headers["X-RateLimit-Hourly-Remaining"] == "0"


@patch("app.services.analysis.AnalysisService.run")
def test_burst_limit_still_fires_for_authenticated_user(mock_run, _override_optional_auth_as_user):
    """The middleware-level burst limit (10/60s/IP) applies regardless of
    auth state. Sending 11 fast requests as an authenticated user from a
    single IP produces an 11th 429 with the burst-window headers, NOT the
    hourly-window headers (which would have ``X-RateLimit-Limit: 30``)."""
    mock_run.return_value = _success_mock()
    headers = {"X-Forwarded-For": "7.7.7.7", "Authorization": "Bearer test-token"}

    for i in range(10):
        r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
        assert r.status_code == 201, f"Request {i + 1} unexpectedly rejected ({r.status_code})"

    r = client.post("/api/v1/analysis", json=_analysis_payload(), headers=headers)
    assert r.status_code == 429
    # Burst limiter sets X-RateLimit-Limit: 10 (no "Hourly" prefix). If the
    # hourly path had fired instead, the limit would read "30".
    assert r.headers["X-RateLimit-Limit"] == "10"
    assert r.headers["Retry-After"] == "60"


def test_invalid_bearer_token_raises_401():
    """A malformed/expired bearer token must raise 401, not silently demote
    the caller to the 3/hr anonymous bucket."""

    def _raise_401():
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    app.dependency_overrides[get_current_user_optional] = _raise_401
    try:
        r = client.post(
            "/api/v1/analysis",
            json=_analysis_payload(),
            headers={"Authorization": "Bearer garbage", "X-Forwarded-For": "6.6.6.6"},
        )
        assert r.status_code == 401
    finally:
        app.dependency_overrides.pop(get_current_user_optional, None)


@patch("app.services.analysis.AnalysisService.run")
def test_create_analysis_no_auth_header_uses_anon_bucket(mock_run):
    """A single anonymous request succeeds and reports the 3/hr anon limit."""
    mock_run.return_value = _success_mock()
    r = client.post(
        "/api/v1/analysis",
        json=_analysis_payload(),
        headers={"X-Forwarded-For": "5.5.5.5"},
    )
    assert r.status_code == 201
    assert r.headers["X-RateLimit-Hourly-Limit"] == "3"
    assert r.headers["X-RateLimit-Hourly-Remaining"] == "2"
