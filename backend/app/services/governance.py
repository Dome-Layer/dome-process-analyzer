from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from app.core.db import get_db
from app.core.logging import get_logger
from app.models.schemas import GovernanceEvent, ProcessAnalysis

logger = get_logger(__name__)

AGENT_ID = "process-analyzer"


def emit_governance_event(
    analysis: ProcessAnalysis,
    input_text: str,
    user_id: str | None = None,
) -> GovernanceEvent:
    """Emit a GovernanceEvent for an analysis run.

    Logs metadata only — never logs the process description content itself.
    """
    input_hash = hashlib.sha256(input_text.encode("utf-8")).hexdigest()

    rules_applied = [
        "step_extraction",
        "systems_identification",
        "governance_flags",
        "automation_opportunities",
        "mermaid_flowchart",
        "metrics_computation",
    ]

    rules_triggered = []
    for flag in analysis.governance_flags:
        rules_triggered.append(f"governance:{flag.category}:{flag.severity.value}")

    if analysis.metrics.shadow_it_detected:
        rules_triggered.append("shadow_it_detected")

    confidence_value = {
        "high": 0.9,
        "medium": 0.7,
        "low": 0.4,
    }.get(analysis.overall_confidence.value)

    human_in_loop = "not_required"
    if analysis.clarifying_questions:
        human_in_loop = "recommended"
    critical_flags = [f for f in analysis.governance_flags if f.severity.value == "critical"]
    if critical_flags:
        human_in_loop = "required"

    event = GovernanceEvent(
        agent_id=AGENT_ID,
        action_type="process_analysis",
        timestamp=datetime.now(timezone.utc),
        input_hash=input_hash,
        input_type="process_description",
        output_summary=(
            f"Analysed '{analysis.process_name}': "
            f"{analysis.metrics.total_steps} steps, "
            f"{len(analysis.governance_flags)} governance flags "
            f"({len(critical_flags)} critical), "
            f"{len(analysis.automation_opportunities)} automation opportunities"
        ),
        rules_applied=rules_applied,
        rules_triggered=rules_triggered,
        confidence=confidence_value,
        human_in_loop=human_in_loop,
        user_id=user_id,
        metadata={
            "analysis_id": analysis.analysis_id,
            "process_domain": analysis.process_domain,
            "analysis_version": analysis.analysis_version,
            "overall_confidence": analysis.overall_confidence.value,
        },
    )

    try:
        db = get_db()
        payload = {
            "agent_id": event.agent_id,
            "action_type": event.action_type,
            "timestamp": event.timestamp.isoformat(),
            "input_hash": event.input_hash,
            "input_type": event.input_type,
            "output_summary": event.output_summary,
            "rules_applied": event.rules_applied,
            "rules_triggered": event.rules_triggered,
            "confidence": event.confidence,
            "human_in_loop": event.human_in_loop,
            "user_id": event.user_id,
            "workflow_run_id": event.workflow_run_id,
            "metadata": event.metadata,
        }
        db.table("governance_events").insert(payload).execute()
        logger.info(
            "governance_event_emitted",
            agent_id=event.agent_id,
            action_type=event.action_type,
            analysis_id=analysis.analysis_id,
            input_hash=input_hash[:12],
            confidence=confidence_value,
            human_in_loop=human_in_loop,
            governance_flags_count=len(analysis.governance_flags),
            critical_flags_count=len(critical_flags),
        )
    except Exception as e:
        # Governance persistence must never break the main analysis flow.
        logger.error("governance_event_failed", error=str(e), analysis_id=analysis.analysis_id)

    return event
