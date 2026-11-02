import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { GovernanceFlag, GovernanceSeverity } from "@/lib/types";
import { clsx } from "@/lib/clsx";
import { useT } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

const severityBorderClass: Record<GovernanceSeverity, string> = {
  critical: "border-l-dome-status-critical",
  major: "border-l-dome-status-major",
  minor: "border-l-dome-accent",
};

function FlagCard({ flag, t }: { flag: GovernanceFlag; t: Messages }) {
  return (
    <div
      className={clsx(
        "border border-dome-border rounded-dome p-4 border-l-4",
        severityBorderClass[flag.severity]
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant={flag.severity}>{t.governance.severity[flag.severity]}</Badge>
        <Badge variant="default">
          {t.governance.category[flag.category] ?? flag.category.replace(/_/g, " ")}
        </Badge>
      </div>

      <h4 className="font-sans text-sm font-semibold text-dome-text-primary mb-1.5">
        {flag.title}
      </h4>

      <p className="font-sans text-sm text-dome-text-muted mb-3">
        {flag.description}
      </p>

      <div className="bg-dome-bg-tertiary rounded-dome p-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mb-1">
          {t.governance.recommendation}
        </p>
        <p className="font-sans text-sm text-dome-text-secondary">
          {flag.recommendation}
        </p>
      </div>

      {flag.regulatory_reference && (
        <p className="font-sans text-[11px] text-dome-text-muted mt-2">
          {t.governance.reference}: {flag.regulatory_reference}
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
  const t = useT();
  const critical = flags.filter((f) => f.severity === "critical").length;
  const major = flags.filter((f) => f.severity === "major").length;

  const sorted = [...flags].sort((a, b) => {
    const order: Record<GovernanceSeverity, number> = { critical: 0, major: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card className={className}>
      <SectionLabel>{t.governance.label}</SectionLabel>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-sans text-lg font-semibold text-dome-text-primary">
          {t.governance.raised(flags.length)}
        </h3>
        <div className="flex gap-2">
          {critical > 0 && (
            <Badge variant="critical">{t.governance.critical(critical)}</Badge>
          )}
          {major > 0 && (
            <Badge variant="major">{t.governance.major(major)}</Badge>
          )}
        </div>
      </div>

      {flags.length === 0 ? (
        <p className="font-sans text-sm text-dome-text-muted">
          {t.governance.none}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((flag) => (
            <FlagCard key={flag.id} flag={flag} t={t} />
          ))}
        </div>
      )}
    </Card>
  );
}
