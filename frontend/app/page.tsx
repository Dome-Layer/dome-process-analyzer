"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { AnalysisForm } from "@/components/analyzer/AnalysisForm";
import { AnalysisSkeleton } from "@/components/analyzer/AnalysisSkeleton";
import { StatusCycler } from "@/components/analyzer/StatusCycler";
import { AnalysisResult } from "@/components/analyzer/AnalysisResult";
import { useAnalysis } from "@/hooks/useAnalysis";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const { analysis, analysisId, isSubmitting, isRefining, error, submit, refine, reset } =
    useAnalysis();

  // Show skeleton after a short delay once submitting starts
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let skeletonTimer: ReturnType<typeof setTimeout>;
    let statusTimer: ReturnType<typeof setTimeout>;

    if (isSubmitting) {
      skeletonTimer = setTimeout(() => setShowSkeleton(true), 300);
      statusTimer = setTimeout(() => setShowStatus(true), 1000);
    } else {
      setShowSkeleton(false);
      setShowStatus(false);
    }

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(statusTimer);
    };
  }, [isSubmitting]);

  // Scroll to results once they arrive
  useEffect(() => {
    if (analysis && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis]);

  return (
    <div className="min-h-screen bg-dome-bg-primary">
      <Header />

      <main className="max-w-[1152px] mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-10">
          <SectionLabel>Process Analyzer</SectionLabel>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-dome-text-primary tracking-dome-tight leading-tight mb-3">
            Map, govern, and automate
          </h1>
          <p className="font-body text-base text-dome-text-muted max-w-xl">
            Describe a business process in plain language. Dome returns a structured analysis with
            process steps, systems inventory, governance flags, and automation opportunities.
          </p>
        </div>

        {/* Input form */}
        {!analysis && (
          <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-6 mb-8">
            <AnalysisForm onSubmit={submit} loading={isSubmitting} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-dome-status-critical/5 border border-dome-status-critical/20 rounded-dome p-4 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-dome text-dome-status-critical mb-1">
              Analysis error
            </p>
            <p className="font-body text-sm text-dome-text-secondary">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isSubmitting && (
          <div className="mb-6">
            {showStatus && <div className="mb-4"><StatusCycler /></div>}
            {showSkeleton && <AnalysisSkeleton />}
          </div>
        )}

        {/* Results */}
        {analysis && analysisId && (
          <div ref={resultsRef}>
            {/* New analysis button */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
                Analysis complete
              </p>
              <Button variant="ghost" onClick={reset}>
                ← New analysis
              </Button>
            </div>

            <AnalysisResult
              analysis={analysis}
              analysisId={analysisId}
              onRefine={refine}
              refining={isRefining}
            />
          </div>
        )}
      </main>
    </div>
  );
}
