"use client";

import type { ProcessAnalysis, ClarificationAnswer } from "@/lib/types";
import { SectionMetrics } from "./SectionMetrics";
import { SectionSteps } from "./SectionSteps";
import { SectionSystems } from "./SectionSystems";
import { SectionGovernance } from "./SectionGovernance";
import { SectionAutomation } from "./SectionAutomation";
import { MermaidDiagram } from "./MermaidDiagram";
import { ClarifyingQuestions } from "./ClarifyingQuestions";
import { SaveButton } from "@/components/auth/SaveButton";

interface Props {
  analysis: ProcessAnalysis;
  analysisId: string;
  onRefine: (answers: ClarificationAnswer[]) => void;
  refining: boolean;
}

export function AnalysisResult({ analysis, analysisId, onRefine, refining }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Version badge if refined */}
      {analysis.analysis_version > 1 && (
        <p className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan">
          Version {analysis.analysis_version}
        </p>
      )}

      <SectionMetrics
        analysis={analysis}
        className="section-animate section-delay-0"
      />

      <SectionSteps
        steps={analysis.steps}
        className="section-animate section-delay-1"
      />

      <SectionSystems
        systems={analysis.systems}
        integrations={analysis.integrations}
        className="section-animate section-delay-2"
      />

      <SectionGovernance
        flags={analysis.governance_flags}
        className="section-animate section-delay-3"
      />

      <SectionAutomation
        opportunities={analysis.automation_opportunities}
        className="section-animate section-delay-4"
      />

      {/* Clarifying questions — only show if present */}
      {analysis.clarifying_questions.length > 0 && (
        <ClarifyingQuestions
          questions={analysis.clarifying_questions}
          onRefine={onRefine}
          refining={refining}
          className="section-animate section-delay-5"
        />
      )}

      {/* Mermaid last — heaviest visual element */}
      <MermaidDiagram
        chart={analysis.mermaid_flowchart}
        className="section-animate section-delay-5"
      />

      {/* Save CTA */}
      <div className="flex justify-end pb-8">
        <SaveButton analysisId={analysisId} />
      </div>
    </div>
  );
}
