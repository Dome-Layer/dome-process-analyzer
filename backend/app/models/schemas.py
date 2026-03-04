from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# -- Enumerations -------------------------------------------------------------

class StepType(str, Enum):
    manual = "manual"
    automated = "automated"
    decision = "decision"
    approval = "approval"
    external = "external"


class AutomationPotential(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"
    not_applicable = "not_applicable"


class GovernanceSeverity(str, Enum):
    critical = "critical"
    major = "major"
    minor = "minor"


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# -- Process Step -------------------------------------------------------------

class ProcessStep(BaseModel):
    id: str
    sequence: int
    name: str
    description: str
    step_type: StepType
    actor: str
    systems_involved: list[str]
    duration_estimate_minutes: Optional[int] = None
    wait_time_minutes: Optional[int] = None
    is_bottleneck: bool = False
    confidence: ConfidenceLevel


# -- Systems Map --------------------------------------------------------------

class SystemNode(BaseModel):
    id: str
    name: str
    system_type: str
    vendor: Optional[str] = None
    is_shadow_it: bool = False
    integration_notes: Optional[str] = None


class SystemIntegration(BaseModel):
    from_system: str
    to_system: str
    integration_type: str  # "api", "manual_export", "email", "none"
    data_transferred: str


# -- Governance Flags ---------------------------------------------------------

class GovernanceFlag(BaseModel):
    id: str
    severity: GovernanceSeverity
    category: str
    title: str
    description: str
    affected_steps: list[str]
    recommendation: str
    regulatory_reference: Optional[str] = None


# -- Automation Opportunities -------------------------------------------------

class AutomationOpportunity(BaseModel):
    id: str
    title: str
    description: str
    affected_steps: list[str]
    automation_potential: AutomationPotential
    automation_type: str
    estimated_time_saving_minutes_per_instance: Optional[int] = None
    implementation_complexity: str  # "low", "medium", "high"
    prerequisites: list[str]


# -- Process Metrics ----------------------------------------------------------

class ProcessMetrics(BaseModel):
    total_steps: int
    manual_steps: int
    automated_steps: int
    decision_points: int
    estimated_total_duration_minutes: Optional[int] = None
    estimated_wait_time_minutes: Optional[int] = None
    estimated_active_work_minutes: Optional[int] = None
    systems_count: int
    shadow_it_detected: bool
    automation_coverage_percent: Optional[float] = None


# -- Clarifying Questions -----------------------------------------------------

class ClarifyingQuestion(BaseModel):
    id: str
    question: str
    context: str
    affects: str  # "governance", "automation", "systems", "timing", "steps"


# -- Root Analysis Model ------------------------------------------------------

class ProcessAnalysis(BaseModel):
    analysis_id: str
    process_name: str
    process_domain: str
    process_owner_role: Optional[str] = None
    description_summary: str

    steps: list[ProcessStep]
    systems: list[SystemNode]
    integrations: list[SystemIntegration]
    governance_flags: list[GovernanceFlag]
    automation_opportunities: list[AutomationOpportunity]

    mermaid_flowchart: str

    metrics: ProcessMetrics
    clarifying_questions: list[ClarifyingQuestion]

    overall_confidence: ConfidenceLevel
    analysis_version: int = 1
    created_at: datetime


# -- API Request / Response Models --------------------------------------------

class AnalysisStatus(str, Enum):
    processing = "processing"
    complete = "complete"
    failed = "failed"


class AnalysisRequest(BaseModel):
    description: str = Field(min_length=50, max_length=10000)
    process_name: Optional[str] = Field(default=None, max_length=120)
    domain_hint: Optional[str] = None


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    analysis: ProcessAnalysis
    session_token: Optional[str] = None


class ClarificationAnswer(BaseModel):
    question_id: str
    answer: str = Field(max_length=2000)


class RefineRequest(BaseModel):
    answers: list[ClarificationAnswer] = Field(min_length=1)


class RefineResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    analysis: ProcessAnalysis
    previous_version: int


class AnalysisDetailResponse(BaseModel):
    analysis_id: str
    saved: bool
    analysis: ProcessAnalysis
    created_at: datetime
    updated_at: datetime


class SaveRequest(BaseModel):
    consent: bool
    label: Optional[str] = Field(default=None, max_length=120)


class SaveResponse(BaseModel):
    analysis_id: str
    saved: bool
    saved_at: datetime


class AnalysisSummary(BaseModel):
    analysis_id: str
    process_name: str
    process_domain: str
    overall_confidence: str
    analysis_version: int
    total_steps: int
    governance_flags_critical: int
    automation_opportunities: int
    saved_at: datetime
    label: Optional[str] = None


class AnalysisListResponse(BaseModel):
    analyses: list[AnalysisSummary]
    total: int


class MagicLinkRequest(BaseModel):
    email: str = Field(pattern=r"^[^@]+@[^@]+\.[^@]+$")


class MagicLinkResponse(BaseModel):
    message: str
    expires_in_minutes: int


class VerifyRequest(BaseModel):
    token: str


class SessionResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    expires_at: datetime


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None


# -- Governance Event (shared Dome schema) ------------------------------------

class GovernanceEvent(BaseModel):
    agent_id: str
    action_type: str
    timestamp: datetime
    input_hash: str
    input_type: str
    output_summary: str
    rules_applied: list[str]
    rules_triggered: list[str]
    confidence: Optional[float]
    human_in_loop: str  # "not_required", "recommended", "required", "completed"
    user_id: Optional[str]
    metadata: dict
