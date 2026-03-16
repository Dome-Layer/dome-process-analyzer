import { type ReactNode } from "react";
import { clsx } from "@/lib/clsx";

type BadgeVariant = "default" | "critical" | "major" | "minor" | "success" | "high" | "medium" | "low";

const variantClasses: Record<BadgeVariant, string> = {
  default: "text-dome-accent-cyan border-dome-accent-cyan/25 bg-dome-accent-cyan/5",
  critical: "text-dome-status-critical border-dome-status-critical/25 bg-dome-status-critical/5",
  major: "text-dome-status-major border-dome-status-major/25 bg-dome-status-major/5",
  minor: "text-dome-status-minor border-dome-status-minor/25 bg-dome-status-minor/5",
  success: "text-dome-status-success border-dome-status-success/25 bg-dome-status-success/5",
  high: "text-dome-status-success border-dome-status-success/25 bg-dome-status-success/5",
  medium: "text-dome-status-major border-dome-status-major/25 bg-dome-status-major/5",
  low: "text-dome-text-muted border-dome-border bg-dome-bg-tertiary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-mono text-[11px] font-medium uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-dome border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
