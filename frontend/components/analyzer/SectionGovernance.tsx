import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { GovernanceFlag, GovernanceSeverity } from "@/lib/types";
import { clsx } from "@/lib/clsx";

const severityBorderClass: Record<GovernanceSeverity, string> = {
  critical: "border-l-dome-status-critical",
  major: "border-l-dome-status-major",
  minor: "border-l-dome-accent",
};

function FlagCard({ flag }: { flag: GovernanceFlag }) {
  return (
    <div
      className={clsx(
        "border border-dome-border rounded-dome p-4 border-l-4",
        severityBorderClass[flag.severity]
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant={flag.severity}>{flag.severity}</Badge>
        <Badge variant="default">{flag.category.replace(/_/g, " ")}</Badge>
      </div>

      <h4 className="font-sans text-sm font-semibold text-dome-text-primary mb-1.5">
        {flag.title}
      </h4>

      <p className="font-sans text-sm text-dome-text-muted mb-3">
        {flag.description}
      </p>

      <div className="bg-dome-bg-tertiary rounded-dome p-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mb-1">
          Recommendation
        </p>
        <p className="font-sans text-sm text-dome-text-secondary">
          {flag.recommendation}
        </p>
      </div>

      {flag.regulatory_reference && (
        <p className="font-sans text-[11px] text-dome-text-muted mt-2">
          Ref: {flag.regulatory_reference}
        </p>
      )}
    </div>
  );
}

interface Props {
  flags: GovernanceFlag[];
  className?: string;
}

export function SectionGovernance({ flags, className }: Props) {
  const critical = flags.filter((f) => f.severity === "critical").length;
  const major = flags.filter((f) => f.severity === "major").length;

  const sorted = [...flags].sort((a, b) => {
    const order: Record<GovernanceSeverity, number> = { critical: 0, major: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card className={className}>
      <SectionLabel>Governance flags</SectionLabel>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-sans text-lg font-semibold text-dome-text-primary">
          {flags.length} flag{flags.length !== 1 ? "s" : ""} raised
        </h3>
        <div className="flex gap-2">
          {critical > 0 && (
            <Badge variant="critical">{critical} critical</Badge>
          )}
          {major > 0 && (
            <Badge variant="major">{major} major</Badge>
          )}
        </div>
      </div>

      {flags.length === 0 ? (
        <p className="font-sans text-sm text-dome-text-muted">
          No governance issues identified.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((flag) => (
            <FlagCard key={flag.id} flag={flag} />
          ))}
        </div>
      )}
    </Card>
  );
}
