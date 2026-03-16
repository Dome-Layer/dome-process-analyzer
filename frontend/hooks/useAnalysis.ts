"use client";

import { useState, useCallback } from "react";
import { submitAnalysis, refineAnalysis } from "@/lib/api";
import type {
  ProcessAnalysis,
  ClarificationAnswer,
} from "@/lib/types";

type LoadingState = "idle" | "submitting" | "refining";

interface AnalysisState {
  analysis: ProcessAnalysis | null;
  analysisId: string | null;
  sessionToken: string | null;
  loading: LoadingState;
  error: string | null;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    analysisId: null,
    sessionToken: null,
    loading: "idle",
    error: null,
  });

  const submit = useCallback(
    async (description: string, processName?: string, domainHint?: string) => {
      setState((s) => ({ ...s, loading: "submitting", error: null }));
      try {
        const res = await submitAnalysis({ description, process_name: processName, domain_hint: domainHint });
        setState({
          analysis: res.analysis,
          analysisId: res.analysis_id,
          sessionToken: res.session_token,
          loading: "idle",
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
        setState((s) => ({ ...s, loading: "idle", error: message }));
      }
    },
    []
  );

  const refine = useCallback(
    async (answers: ClarificationAnswer[]) => {
      if (!state.analysisId || !state.sessionToken) return;
      setState((s) => ({ ...s, loading: "refining", error: null }));
      try {
        const res = await refineAnalysis(state.analysisId, { answers }, state.sessionToken);
        setState((s) => ({
          ...s,
          analysis: res.analysis,
          loading: "idle",
          error: null,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Refinement failed. Please try again.";
        setState((s) => ({ ...s, loading: "idle", error: message }));
      }
    },
    [state.analysisId, state.sessionToken]
  );

  const reset = useCallback(() => {
    setState({
      analysis: null,
      analysisId: null,
      sessionToken: null,
      loading: "idle",
      error: null,
    });
  }, []);

  return {
    ...state,
    isSubmitting: state.loading === "submitting",
    isRefining: state.loading === "refining",
    submit,
    refine,
    reset,
  };
}
