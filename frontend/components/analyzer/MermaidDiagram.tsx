"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface Props {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!containerRef.current || !chart) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#FFFFFF",
            primaryBorderColor: "#E2E2E0",
            primaryTextColor: "#0C0C0E",
            lineColor: "#8A8A8F",
            secondaryColor: "#F0F0EE",
            tertiaryColor: "#FAFAF9",
            fontFamily: "Outfit, Helvetica Neue, sans-serif",
            fontSize: "13px",
          },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to render diagram.";
          setError(msg);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  return (
    <Card className={className}>
      <SectionLabel>Process flowchart</SectionLabel>
      <h3 className="font-display text-lg font-semibold text-dome-text-primary mb-5">
        Mermaid diagram
      </h3>

      {error ? (
        <div className="bg-dome-bg-tertiary rounded-dome p-4">
          <p className="font-mono text-[11px] uppercase tracking-dome text-dome-status-critical mb-1">
            Diagram render error
          </p>
          <p className="font-body text-xs text-dome-text-muted">{error}</p>
          <details className="mt-3">
            <summary className="font-mono text-[11px] text-dome-text-muted cursor-pointer">
              Raw source
            </summary>
            <pre className="mt-2 text-xs text-dome-text-muted whitespace-pre-wrap break-all">
              {chart}
            </pre>
          </details>
        </div>
      ) : !rendered ? (
        <div className="flex items-center gap-2 py-8 justify-center">
          <span className="w-4 h-4 border-2 border-dome-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
            Rendering diagram
          </span>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="mermaid-container overflow-x-auto"
        aria-label="Process flowchart diagram"
      />
    </Card>
  );
}
