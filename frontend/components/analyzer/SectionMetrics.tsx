import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ProcessAnalysis } from "@/lib/types";
import { formatMinutes } from "@/lib/format";
import { useIntlLocale, useT } from "@/lib/i18n";

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

interface Props {
  analysis: ProcessAnalysis;
  className?: string;
}

export function SectionMetrics({ analysis, className }: Props) {
  const { metrics, overall_confidence, process_name, process_domain, description_summary } = analysis;

  const confidenceVariant = overall_confidence as "high" | "medium" | "low";
  const t = useT();
  const intlLocale = useIntlLocale();
  const duration = (mins: number | null) => formatMinutes(t, mins) ?? t.notAvailable;

  return (
    <Card className={className}>
      <SectionLabel>{t.metrics.label}</SectionLabel>

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
          {t.metrics.confidence(confidenceVariant)}
        </Badge>
      </div>

      <p className="font-sans text-sm text-dome-text-secondary leading-relaxed mb-6">
        {description_summary}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label={t.metrics.totalSteps} value={metrics.total_steps} />
        <MetricTile label={t.metrics.manualSteps} value={metrics.manual_steps} />
        <MetricTile label={t.metrics.systems} value={metrics.systems_count} />
        <MetricTile
          label={t.metrics.automation}
          value={metrics.automation_coverage_percent !== null
            ? new Intl.NumberFormat(intlLocale, { style: "percent", maximumFractionDigits: 0 }).format(
                metrics.automation_coverage_percent / 100
              )
            : t.notAvailable}
        />
      </div>

      {(metrics.estimated_total_duration_minutes !== null ||
        metrics.estimated_active_work_minutes !== null) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {metrics.estimated_total_duration_minutes !== null && (
            <MetricTile
              label={t.metrics.totalDuration}
              value={duration(metrics.estimated_total_duration_minutes)}
            />
          )}
          {metrics.estimated_active_work_minutes !== null && (
            <MetricTile
              label={t.metrics.activeWork}
              value={duration(metrics.estimated_active_work_minutes)}
            />
          )}
          {metrics.estimated_wait_time_minutes !== null && (
            <MetricTile
              label={t.metrics.waitTime}
              value={duration(metrics.estimated_wait_time_minutes)}
            />
          )}
        </div>
      )}

      {metrics.shadow_it_detected && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-dome-status-major/5 border border-dome-status-major/20 rounded-dome">
          <span className="w-1.5 h-1.5 rounded-full bg-dome-status-major flex-shrink-0" />
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-status-major">
            {t.metrics.shadowIt}
          </p>
        </div>
      )}
    </Card>
  );
}
