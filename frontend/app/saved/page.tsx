"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { listAnalyses, deleteAnalysis } from "@/lib/api";
import type { AnalysisSummary } from "@/lib/types";

function AnalysisRow({
  summary,
  onDelete,
}: {
  summary: AnalysisSummary;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteAnalysis(summary.analysis_id);
      onDelete(summary.analysis_id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const savedAt = new Date(summary.saved_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-dome-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-sm font-semibold text-dome-text-primary truncate">
            {summary.label || summary.process_name}
          </span>
          {summary.label && (
            <span className="font-body text-xs text-dome-text-muted truncate">
              — {summary.process_name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-[11px] text-dome-text-muted">{summary.process_domain}</span>
          <span className="font-mono text-[11px] text-dome-text-muted">·</span>
          <span className="font-mono text-[11px] text-dome-text-muted">{summary.total_steps} steps</span>
          {summary.governance_flags_critical > 0 && (
            <>
              <span className="font-mono text-[11px] text-dome-text-muted">·</span>
              <span className="font-mono text-[11px] text-dome-status-critical">
                {summary.governance_flags_critical} critical
              </span>
            </>
          )}
          <span className="font-mono text-[11px] text-dome-text-muted">·</span>
          <span className="font-mono text-[11px] text-dome-text-muted">{savedAt}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={summary.overall_confidence as "high" | "medium" | "low"}>
          {summary.overall_confidence}
        </Badge>
        <Link href={`/saved/${summary.analysis_id}`}>
          <Button variant="secondary">View</Button>
        </Link>
        <Button
          variant={confirmDelete ? "primary" : "ghost"}
          onClick={handleDelete}
          loading={deleting}
          className={confirmDelete ? "text-xs" : ""}
        >
          {confirmDelete ? "Confirm delete" : "Delete"}
        </Button>
        {confirmDelete && (
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    listAnalyses()
      .then((res) => {
        setAnalyses(res.analyses);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load analyses.";
        // Detect Supabase paused
        if (err.status === 503 || msg.toLowerCase().includes("503")) {
          setError("The database is currently paused. Saved analyses are unavailable.");
        } else {
          setError(msg);
        }
        setLoading(false);
      });
  }, [isAuthenticated]);

  function handleDelete(id: string) {
    setAnalyses((prev) => prev.filter((a) => a.analysis_id !== id));
  }

  return (
    <div className="min-h-screen bg-dome-bg-primary">
      <Header />
      <main className="max-w-[1152px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8">
          <SectionLabel>Library</SectionLabel>
          <h1 className="font-display text-3xl font-semibold text-dome-text-primary tracking-dome-tight mb-2">
            Saved analyses
          </h1>
        </div>

        {!isAuthenticated && (
          <Card>
            <p className="font-body text-sm text-dome-text-muted mb-4">
              Sign in to view and manage your saved analyses.
            </p>
            <Link href="/">
              <Button variant="secondary">← Go to analyzer</Button>
            </Link>
          </Card>
        )}

        {isAuthenticated && loading && (
          <div className="flex items-center gap-2 py-12">
            <span className="w-4 h-4 border-2 border-dome-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
              Loading
            </span>
          </div>
        )}

        {isAuthenticated && error && (
          <div className="bg-dome-status-critical/5 border border-dome-status-critical/20 rounded-dome p-4">
            <p className="font-mono text-[11px] uppercase tracking-dome text-dome-status-critical mb-1">
              Error
            </p>
            <p className="font-body text-sm text-dome-text-secondary">{error}</p>
          </div>
        )}

        {isAuthenticated && !loading && !error && (
          <>
            {analyses.length === 0 ? (
              <Card>
                <p className="font-body text-sm text-dome-text-muted mb-4">
                  No analyses saved yet. Run an analysis and click &ldquo;Save analysis&rdquo; to store it here.
                </p>
                <Link href="/">
                  <Button variant="secondary">← Go to analyzer</Button>
                </Link>
              </Card>
            ) : (
              <Card className="p-0">
                <div className="px-6 py-4 border-b border-dome-border">
                  <p className="font-mono text-[11px] uppercase tracking-dome text-dome-text-muted">
                    {analyses.length} saved
                  </p>
                </div>
                {analyses.map((a) => (
                  <AnalysisRow key={a.analysis_id} summary={a} onDelete={handleDelete} />
                ))}
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
