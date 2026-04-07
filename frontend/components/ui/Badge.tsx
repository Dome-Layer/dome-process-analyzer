import { type ReactNode } from "react";
import { clsx } from "@/lib/clsx";

type BadgeVariant = "default" | "critical" | "major" | "minor" | "success" | "high" | "medium" | "low";

const variantClasses: Record<BadgeVariant, string> = {
  default:  "text-dome-accent border-dome-border-accent bg-dome-bg-accent",
  critical: "text-dome-status-critical border-dome-status-critical/25 bg-dome-status-critical/5",
  major:    "text-dome-status-major border-dome-status-major/25 bg-dome-status-major/5",
  minor:    "text-dome-accent border-dome-border-accent bg-dome-bg-accent",
  success:  "text-dome-status-success border-dome-status-success/25 bg-dome-status-success/5",
  high:     "text-dome-status-success border-dome-status-success/25 bg-dome-status-success/5",
  medium:   "text-dome-status-major border-dome-status-major/25 bg-dome-status-major/5",
  low:      "text-dome-text-muted border-dome-border bg-dome-bg-tertiary",
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
        "inline-flex items-center font-sans text-[10px] font-semibold uppercase tracking-dome px-2.5 py-1 rounded-dome border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
