import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { AutomationOpportunity, AutomationPotential } from "@/lib/types";
import { formatMinutes } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

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

function OpportunityCard({ opp, t }: { opp: AutomationOpportunity; t: Messages }) {
  const complexity = opp.implementation_complexity as "high" | "medium" | "low";
  return (
    <div className="border border-dome-border rounded-dome p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant={potentialVariant[opp.automation_potential]}>
          {opp.automation_potential === "not_applicable"
            ? t.notAvailable
            : t.automation.potential(opp.automation_potential)}
        </Badge>
        <Badge variant="default">
          {t.automation.type[opp.automation_type] ?? opp.automation_type}
        </Badge>
        <Badge variant={complexityVariant[opp.implementation_complexity] ?? "medium"}>
          {t.automation.complexity(complexity)}
        </Badge>
      </div>

      <h4 className="font-sans text-sm font-semibold text-dome-text-primary mb-1.5">
        {opp.title}
      </h4>

      <p className="font-sans text-sm text-dome-text-muted mb-3">{opp.description}</p>

      {opp.estimated_time_saving_minutes_per_instance !== null && (
        <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-accent mb-3">
          {t.automation.saving(formatMinutes(t, opp.estimated_time_saving_minutes_per_instance) ?? "")}
        </p>
      )}

      {opp.prerequisites.length > 0 && (
        <div className="bg-dome-bg-tertiary rounded-dome p-3">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mb-1.5">
            {t.automation.prerequisites}
          </p>
          <ul className="flex flex-col gap-1">
            {opp.prerequisites.map((p, i) => (
              <li key={i} className="font-sans text-xs text-dome-text-muted flex gap-1.5">
                <span className="text-dome-accent">·</span>
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
  const t = useT();
  const high = opportunities.filter((o) => o.automation_potential === "high").length;

  return (
    <Card className={className}>
      <SectionLabel>{t.automation.label}</SectionLabel>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-sans text-lg font-semibold text-dome-text-primary">
          {t.automation.identified(opportunities.length)}
        </h3>
        {high > 0 && (
          <Badge variant="high">{t.automation.highPotential(high)}</Badge>
        )}
      </div>

      {opportunities.length === 0 ? (
        <p className="font-sans text-sm text-dome-text-muted">
          {t.automation.none}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} t={t} />
          ))}
        </div>
      )}
    </Card>
  );
}
