"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@dome-layer/dome-ui";
import { submitAnalysis, refineAnalysis } from "@/lib/api";
import { useT } from "@/lib/i18n";
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
  // The backend writes the analysis in the language the visitor reads the tool in.
  const locale = useLocale();
  const t = useT();
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
        const res = await submitAnalysis({
          description,
          process_name: processName,
          domain_hint: domainHint,
          output_language: locale,
        });
        setState({
          analysis: res.analysis,
          analysisId: res.analysis_id,
          sessionToken: res.session_token,
          loading: "idle",
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : t.errors.analysisFailed;
        setState((s) => ({ ...s, loading: "idle", error: message }));
      }
    },
    [locale, t]
  );

  const refine = useCallback(
    async (answers: ClarificationAnswer[]) => {
      if (!state.analysisId || !state.sessionToken) return;
      setState((s) => ({ ...s, loading: "refining", error: null }));
      try {
        const res = await refineAnalysis(
          state.analysisId,
          { answers, output_language: locale },
          state.sessionToken
        );
        setState((s) => ({
          ...s,
          analysis: res.analysis,
          loading: "idle",
          error: null,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : t.errors.refineFailed;
        setState((s) => ({ ...s, loading: "idle", error: message }));
      }
    },
    [state.analysisId, state.sessionToken, locale, t]
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
