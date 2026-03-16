// TypeScript types mirroring the backend Pydantic schemas (01_schema.py)

export type StepType = "manual" | "automated" | "decision" | "approval" | "external";
export type AutomationPotential = "high" | "medium" | "low" | "not_applicable";
export type GovernanceSeverity = "critical" | "major" | "minor";
export type ConfidenceLevel = "high" | "medium" | "low";
export type AnalysisStatus = "processing" | "complete" | "failed";

export interface ProcessStep {
  id: string;
  sequence: number;
  name: string;
  description: string;
  step_type: StepType;
  actor: string;
  systems_involved: string[];
  duration_estimate_minutes: number | null;
  wait_time_minutes: number | null;
  is_bottleneck: boolean;
  confidence: ConfidenceLevel;
}

export interface SystemNode {
  id: string;
  name: string;
  system_type: string;
  vendor: string | null;
  is_shadow_it: boolean;
  integration_notes: string | null;
}

export interface SystemIntegration {
  from_system: string;
  to_system: string;
  integration_type: string;
  data_transferred: string;
}

export interface GovernanceFlag {
  id: string;
  severity: GovernanceSeverity;
  category: string;
  title: string;
  description: string;
  affected_steps: string[];
  recommendation: string;
  regulatory_reference: string | null;
}

export interface AutomationOpportunity {
  id: string;
  title: string;
  description: string;
  affected_steps: string[];
  automation_potential: AutomationPotential;
  automation_type: string;
  estimated_time_saving_minutes_per_instance: number | null;
  implementation_complexity: string;
  prerequisites: string[];
}

export interface ProcessMetrics {
  total_steps: number;
  manual_steps: number;
  automated_steps: number;
  decision_points: number;
  estimated_total_duration_minutes: number | null;
  estimated_wait_time_minutes: number | null;
  estimated_active_work_minutes: number | null;
  systems_count: number;
  shadow_it_detected: boolean;
  automation_coverage_percent: number | null;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  context: string;
  affects: string;
}

export interface ProcessAnalysis {
  analysis_id: string;
  process_name: string;
  process_domain: string;
  process_owner_role: string | null;
  description_summary: string;
  steps: ProcessStep[];
  systems: SystemNode[];
  integrations: SystemIntegration[];
  governance_flags: GovernanceFlag[];
  automation_opportunities: AutomationOpportunity[];
  mermaid_flowchart: string;
  metrics: ProcessMetrics;
  clarifying_questions: ClarifyingQuestion[];
  overall_confidence: ConfidenceLevel;
  analysis_version: number;
  created_at: string;
}

// API Request / Response types

export interface AnalysisRequest {
  description: string;
  process_name?: string;
  domain_hint?: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  analysis: ProcessAnalysis;
  session_token: string | null;
}

export interface ClarificationAnswer {
  question_id: string;
  answer: string;
}

export interface RefineRequest {
  answers: ClarificationAnswer[];
}

export interface RefineResponse {
  analysis_id: string;
  status: AnalysisStatus;
  analysis: ProcessAnalysis;
  previous_version: number;
}

export interface AnalysisDetailResponse {
  analysis_id: string;
  saved: boolean;
  analysis: ProcessAnalysis;
  created_at: string;
  updated_at: string;
}

export interface SaveRequest {
  consent: boolean;
  label?: string;
}

export interface SaveResponse {
  analysis_id: string;
  saved: boolean;
  saved_at: string;
}

export interface AnalysisSummary {
  analysis_id: string;
  process_name: string;
  process_domain: string;
  overall_confidence: string;
  analysis_version: number;
  total_steps: number;
  governance_flags_critical: number;
  automation_opportunities: number;
  saved_at: string;
  label: string | null;
}

export interface AnalysisListResponse {
  analyses: AnalysisSummary[];
  total: number;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkResponse {
  message: string;
  expires_in_minutes: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
