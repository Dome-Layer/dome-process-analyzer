import { type ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-dome text-dome-accent-cyan mb-3">
      {children}
    </p>
  );
}
