import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { AutomationOpportunity, AutomationPotential } from "@/lib/types";

const potentialVariant: Record<AutomationPotential, "high" | "medium" | "low"> = {
  high: "high",
  medium: "medium",
  low: "low",
  not_applicable: "low",
};

const complexityVariant: Record<string, "high" | "medium" | "low"> = {
  low: "high",
  medium: "medium",
  high: "low",
};

const automationTypeLabel: Record<string, string> = {
  rpa: "RPA",
  ai_extraction: "AI Extraction",
  api_integration: "API Integration",
  workflow_engine: "Workflow Engine",
  llm_agent: "LLM Agent",
  rule_engine: "Rule Engine",
};

function OpportunityCard({ opp }: { opp: AutomationOpportunity }) {
  return (
    <div className="border border-dome-border rounded-dome p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant={potentialVariant[opp.automation_potential]}>
          {opp.automation_potential === "not_applicable"
            ? "N/A"
            : `${opp.automation_potential} potential`}
        </Badge>
        <Badge variant="default">
          {automationTypeLabel[opp.automation_type] ?? opp.automation_type}
        </Badge>
        <Badge variant={complexityVariant[opp.implementation_complexity] ?? "medium"}>
          {opp.implementation_complexity} complexity
        </Badge>
      </div>

      <h4 className="font-display text-sm font-semibold text-dome-text-primary mb-1.5">
        {opp.title}
      </h4>

      <p className="font-body text-sm text-dome-text-muted mb-3">{opp.description}</p>

      {opp.estimated_time_saving_minutes_per_instance !== null && (
        <p className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan mb-3">
          Est. saving:{" "}
          {opp.estimated_time_saving_minutes_per_instance < 60
            ? `${opp.estimated_time_saving_minutes_per_instance}m`
            : `${Math.floor(opp.estimated_time_saving_minutes_per_instance / 60)}h ${opp.estimated_time_saving_minutes_per_instance % 60}m`}{" "}
          / instance
        </p>
      )}

      {opp.prerequisites.length > 0 && (
        <div className="bg-dome-bg-tertiary rounded-dome p-3">
          <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted mb-1.5">
            Prerequisites
          </p>
          <ul className="flex flex-col gap-1">
            {opp.prerequisites.map((p, i) => (
              <li key={i} className="font-body text-xs text-dome-text-muted flex gap-1.5">
                <span className="text-dome-accent-cyan">·</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface Props {
  opportunities: AutomationOpportunity[];
  className?: string;
}

export function SectionAutomation({ opportunities, className }: Props) {
  const high = opportunities.filter((o) => o.automation_potential === "high").length;

  return (
    <Card className={className}>
      <SectionLabel>Automation opportunities</SectionLabel>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold text-dome-text-primary">
          {opportunities.length} opportunit{opportunities.length !== 1 ? "ies" : "y"} identified
        </h3>
        {high > 0 && (
          <Badge variant="high">{high} high potential</Badge>
        )}
      </div>

      {opportunities.length === 0 ? (
        <p className="font-body text-sm text-dome-text-muted">
          No automation opportunities identified.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}
    </Card>
  );
}
