import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ProcessStep, StepType } from "@/lib/types";
import { clsx } from "@/lib/clsx";

const stepTypeLabel: Record<StepType, string> = {
  manual: "Manual",
  automated: "Automated",
  decision: "Decision",
  approval: "Approval",
  external: "External",
};

const stepTypeVariant: Record<StepType, "default" | "success" | "medium" | "low"> = {
  manual: "medium",
  automated: "success",
  decision: "default",
  approval: "default",
  external: "low",
};

function formatMinutes(mins: number | null): string | null {
  if (mins === null) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StepRow({ step, index }: { step: ProcessStep; index: number }) {
  const active = formatMinutes(step.duration_estimate_minutes);
  const wait = formatMinutes(step.wait_time_minutes);

  return (
    <div className="flex gap-4 group">
      {/* Sequence column */}
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <div
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-semibold border",
            step.is_bottleneck
              ? "border-dome-status-critical/40 bg-dome-status-critical/5 text-dome-status-critical"
              : "border-dome-border bg-dome-bg-tertiary text-dome-text-muted"
          )}
        >
          {step.sequence}
        </div>
        {index < 999 && (
          <div className="w-px flex-1 mt-1 bg-dome-border min-h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-sans text-sm font-semibold text-dome-text-primary">
            {step.name}
          </span>
          <Badge variant={stepTypeVariant[step.step_type]}>
            {stepTypeLabel[step.step_type]}
          </Badge>
          {step.is_bottleneck && (
            <Badge variant="critical">Bottleneck</Badge>
          )}
          {step.confidence === "low" && (
            <Badge variant="low">Inferred</Badge>
          )}
        </div>

        <p className="font-sans text-sm text-dome-text-muted mb-2">
          {step.description}
        </p>

        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="font-sans uppercase tracking-dome text-dome-text-muted">
            Actor: <span className="text-dome-text-secondary">{step.actor}</span>
          </span>
          {active && (
            <span className="font-sans uppercase tracking-dome text-dome-text-muted">
              Active: <span className="text-dome-text-secondary">{active}</span>
            </span>
          )}
          {wait && (
            <span className="font-sans uppercase tracking-dome text-dome-text-muted">
              Wait: <span className="text-dome-status-major">{wait}</span>
            </span>
          )}
          {step.systems_involved.length > 0 && (
            <span className="font-sans uppercase tracking-dome text-dome-text-muted">
              Systems:{" "}
              <span className="text-dome-text-secondary">
                {step.systems_involved.join(", ")}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  steps: ProcessStep[];
  className?: string;
}

export function SectionSteps({ steps, className }: Props) {
  return (
    <Card className={className}>
      <SectionLabel>Process steps</SectionLabel>
      <h3 className="font-sans text-lg font-semibold text-dome-text-primary mb-5">
        {steps.length} steps mapped
      </h3>
      <div>
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} index={i} />
        ))}
      </div>
    </Card>
  );
}
