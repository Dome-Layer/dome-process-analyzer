import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ProcessAnalysis } from "@/lib/types";

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-dome-bg-tertiary rounded-dome p-4">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mb-1.5">
        {label}
      </p>
      <p className="font-sans text-xl font-bold text-dome-text-primary">{value}</p>
    </div>
  );
}

function formatMinutes(mins: number | null): string {
  if (mins === null) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  analysis: ProcessAnalysis;
  className?: string;
}

export function SectionMetrics({ analysis, className }: Props) {
  const { metrics, overall_confidence, process_name, process_domain, description_summary } = analysis;

  const confidenceVariant = overall_confidence as "high" | "medium" | "low";

  return (
    <Card className={className}>
      <SectionLabel>Analysis summary</SectionLabel>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-dome-text-primary leading-tight">
            {process_name}
          </h2>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted mt-1">
            {process_domain}
          </p>
        </div>
        <Badge variant={confidenceVariant}>
          {overall_confidence} confidence
        </Badge>
      </div>

      <p className="font-sans text-sm text-dome-text-secondary leading-relaxed mb-6">
        {description_summary}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="Total steps" value={metrics.total_steps} />
        <MetricTile label="Manual steps" value={metrics.manual_steps} />
        <MetricTile label="Systems" value={metrics.systems_count} />
        <MetricTile
          label="Automation"
          value={metrics.automation_coverage_percent !== null
            ? `${metrics.automation_coverage_percent.toFixed(0)}%`
            : "—"}
        />
      </div>

      {(metrics.estimated_total_duration_minutes !== null ||
        metrics.estimated_active_work_minutes !== null) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {metrics.estimated_total_duration_minutes !== null && (
            <MetricTile
              label="Total duration"
              value={formatMinutes(metrics.estimated_total_duration_minutes)}
            />
          )}
          {metrics.estimated_active_work_minutes !== null && (
            <MetricTile
              label="Active work"
              value={formatMinutes(metrics.estimated_active_work_minutes)}
            />
          )}
          {metrics.estimated_wait_time_minutes !== null && (
            <MetricTile
              label="Wait time"
              value={formatMinutes(metrics.estimated_wait_time_minutes)}
            />
          )}
        </div>
      )}

      {metrics.shadow_it_detected && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-dome-status-major/5 border border-dome-status-major/20 rounded-dome">
          <span className="w-1.5 h-1.5 rounded-full bg-dome-status-major flex-shrink-0" />
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-status-major">
            Shadow IT detected
          </p>
        </div>
      )}
    </Card>
  );
}
