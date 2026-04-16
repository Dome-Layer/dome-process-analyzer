"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
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
            primaryBorderColor: "#E8E8E8",
            primaryTextColor: "#0A0A0A",
            lineColor: "#A3A3A3",
            secondaryColor: "#F5F5F5",
            tertiaryColor: "#FAFAFA",
            fontFamily: "Inter, Helvetica Neue, sans-serif",
            fontSize: "13px",
          },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        let svg: string;
        try {
          const result = await mermaid.render(id, chart);
          svg = result.svg;
        } finally {
          // Mermaid v10 appends a temporary div (id=`d${id}`) to document.body
          // for rendering. It isn't always removed on error, leaving the raw
          // error text visible at the bottom of the page.
          document.getElementById(`d${id}`)?.remove();
        }

        // Mermaid v10 sometimes returns an error SVG instead of throwing.
        // Detect this by checking for its error marker class.
        if (svg.includes('class="error-icon"') || svg.includes('Syntax error')) {
          throw new Error("Diagram contains a syntax error. Check node IDs for reserved keywords.");
        }

        if (!cancelled && containerRef.current) {
          const cleanSvg = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            // Mermaid renders node labels via <foreignObject><div><p>text</p></div></foreignObject>.
            // The SVG profile strips HTML elements, so we explicitly allow them here.
            ADD_TAGS: ["foreignObject", "div", "span", "p", "br", "style"],
            ADD_ATTR: ["dominant-baseline", "text-anchor", "requiredExtensions"],
          });
          containerRef.current.innerHTML = cleanSvg;
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
      <h3 className="font-sans text-lg font-semibold text-dome-text-primary mb-5">
        Mermaid diagram
      </h3>

      {error ? (
        <div className="bg-dome-bg-tertiary rounded-dome p-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-status-critical mb-1">
            Diagram render error
          </p>
          <p className="font-sans text-xs text-dome-text-muted">{error}</p>
          <details className="mt-3">
            <summary className="font-sans text-[11px] text-dome-text-muted cursor-pointer">
              Raw source
            </summary>
            <pre className="mt-2 text-xs text-dome-text-muted whitespace-pre-wrap break-all font-mono">
              {chart}
            </pre>
          </details>
        </div>
      ) : !rendered ? (
        <div className="flex items-center gap-2 py-8 justify-center">
          <span className="w-4 h-4 border-2 border-dome-accent border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-muted">
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
