import { type ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-accent mb-3">
      {children}
    </p>
  );
}
