import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { SystemNode, SystemIntegration } from "@/lib/types";
import { useT } from "@/lib/i18n";
import type { Messages } from "@/lib/messages";

function SystemCard({ system, t }: { system: SystemNode; t: Messages }) {
  return (
    <div className="bg-dome-bg-tertiary rounded-dome p-4 border border-dome-border">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-sans text-sm font-semibold text-dome-text-primary">
          {system.name}
        </span>
        {system.is_shadow_it && (
          <Badge variant="major">{t.systems.shadowIt}</Badge>
        )}
      </div>
      <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted">
        {system.system_type}
        {system.vendor && ` · ${system.vendor}`}
      </p>
      {system.integration_notes && (
        <p className="font-sans text-xs text-dome-text-muted mt-2">
          {system.integration_notes}
        </p>
      )}
    </div>
  );
}

function IntegrationRow({ integration, t }: { integration: SystemIntegration; t: Messages }) {
  const isManual =
    integration.integration_type === "manual_export" ||
    integration.integration_type === "email";

  return (
    <div className="flex items-center gap-2 text-xs font-sans text-dome-text-muted py-2 border-b border-dome-border last:border-0">
      <span className="text-dome-text-secondary font-medium">{integration.from_system}</span>
      <span aria-hidden>→</span>
      <span className="text-dome-text-secondary font-medium">{integration.to_system}</span>
      <span className="flex-1" />
      <Badge variant={isManual ? "major" : "default"}>
        {t.systems.integration[integration.integration_type] ?? integration.integration_type}
      </Badge>
      <span className="text-dome-text-muted hidden sm:inline">{integration.data_transferred}</span>
    </div>
  );
}

interface Props {
  systems: SystemNode[];
  integrations: SystemIntegration[];
  className?: string;
}

export function SectionSystems({ systems, integrations, className }: Props) {
  const t = useT();
  return (
    <Card className={className}>
      <SectionLabel>{t.systems.label}</SectionLabel>
      <h3 className="font-sans text-lg font-semibold text-dome-text-primary mb-5">
        {t.systems.identified(systems.length)}
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {systems.map((s) => (
          <SystemCard key={s.id} system={s} t={t} />
        ))}
      </div>

      {integrations.length > 0 && (
        <>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mb-3">
            {t.systems.integrations}
          </p>
          <div>
            {integrations.map((ig, i) => (
              <IntegrationRow key={i} integration={ig} t={t} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
