"""Basic endpoint smoke tests for the Dome Process Analyzer API."""

import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.cache import analysis_cache
from app.models.schemas import ProcessAnalysis, ConfidenceLevel

client = TestClient(app)


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
    assert response.json() == {"status": "ok"}


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
            "description": "A " * 30 + "business process that involves multiple steps and systems for testing purposes.",
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
