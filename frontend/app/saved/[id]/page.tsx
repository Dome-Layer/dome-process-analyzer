"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SectionMetrics } from "@/components/analyzer/SectionMetrics";
import { SectionSteps } from "@/components/analyzer/SectionSteps";
import { SectionSystems } from "@/components/analyzer/SectionSystems";
import { SectionGovernance } from "@/components/analyzer/SectionGovernance";
import { SectionAutomation } from "@/components/analyzer/SectionAutomation";
import { MermaidDiagram } from "@/components/analyzer/MermaidDiagram";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useAuth } from "@/context/AuthContext";
import { getAnalysis } from "@/lib/api";
import type { ProcessAnalysis } from "@/lib/types";

export default function SavedAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState<ProcessAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    getAnalysis(id)
      .then((res) => {
        setAnalysis(res.analysis);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load analysis.";
        setError(msg);
        setLoading(false);
      });
  }, [id, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-dome-bg-primary">
      <Header />
      <main className="max-w-[1152px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8">
          <Link href="/saved">
            <Button variant="ghost" className="mb-4 -ml-2 text-dome-text-muted">
              ← Saved analyses
            </Button>
          </Link>

          {analysis && (
            <>
              <SectionLabel>Saved analysis</SectionLabel>
              <h1 className="font-display text-3xl font-semibold text-dome-text-primary tracking-dome-tight mb-1">
                {analysis.process_name}
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
                {analysis.process_domain}
                {analysis.analysis_version > 1 && ` · Version ${analysis.analysis_version}`}
              </p>
            </>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-12">
            <span className="w-4 h-4 border-2 border-dome-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
              Loading
            </span>
          </div>
        )}

        {error && (
          <div className="bg-dome-status-critical/5 border border-dome-status-critical/20 rounded-dome p-4">
            <p className="font-mono text-[11px] uppercase tracking-dome text-dome-status-critical mb-1">
              Error
            </p>
            <p className="font-body text-sm text-dome-text-secondary">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="flex flex-col gap-6">
            <SectionMetrics analysis={analysis} />
            <SectionSteps steps={analysis.steps} />
            <SectionSystems systems={analysis.systems} integrations={analysis.integrations} />
            <SectionGovernance flags={analysis.governance_flags} />
            <SectionAutomation opportunities={analysis.automation_opportunities} />
            <MermaidDiagram chart={analysis.mermaid_flowchart} />
          </div>
        )}
      </main>
    </div>
  );
}
