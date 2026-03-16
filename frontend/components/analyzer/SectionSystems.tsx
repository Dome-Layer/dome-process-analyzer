import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { SystemNode, SystemIntegration } from "@/lib/types";

function SystemCard({ system }: { system: SystemNode }) {
  return (
    <div className="bg-dome-bg-tertiary rounded-dome p-4 border border-dome-border">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-display text-sm font-semibold text-dome-text-primary">
          {system.name}
        </span>
        {system.is_shadow_it && (
          <Badge variant="major">Shadow IT</Badge>
        )}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
        {system.system_type}
        {system.vendor && ` · ${system.vendor}`}
      </p>
      {system.integration_notes && (
        <p className="font-body text-xs text-dome-text-muted mt-2">
          {system.integration_notes}
        </p>
      )}
    </div>
  );
}

const integrationLabel: Record<string, string> = {
  api: "API",
  manual_export: "Manual export",
  email: "Email",
  none: "None",
};

function IntegrationRow({ integration }: { integration: SystemIntegration }) {
  const isManual =
    integration.integration_type === "manual_export" ||
    integration.integration_type === "email";

  return (
    <div className="flex items-center gap-2 text-xs font-body text-dome-text-muted py-2 border-b border-dome-border last:border-0">
      <span className="text-dome-text-secondary font-medium">{integration.from_system}</span>
      <span aria-hidden>→</span>
      <span className="text-dome-text-secondary font-medium">{integration.to_system}</span>
      <span className="flex-1" />
      <Badge variant={isManual ? "major" : "default"}>
        {integrationLabel[integration.integration_type] ?? integration.integration_type}
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
  return (
    <Card className={className}>
      <SectionLabel>Systems map</SectionLabel>
      <h3 className="font-display text-lg font-semibold text-dome-text-primary mb-5">
        {systems.length} system{systems.length !== 1 ? "s" : ""} identified
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {systems.map((s) => (
          <SystemCard key={s.id} system={s} />
        ))}
      </div>

      {integrations.length > 0 && (
        <>
          <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted mb-3">
            Integrations
          </p>
          <div>
            {integrations.map((ig, i) => (
              <IntegrationRow key={i} integration={ig} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
