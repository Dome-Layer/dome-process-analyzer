import { authHeaders } from "./auth";
import type {
  AnalysisListResponse,
  AnalysisRequest,
  AnalysisResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  RefineRequest,
  RefineResponse,
  SaveRequest,
  SaveResponse,
} from "./types";

// In dev, NEXT_PUBLIC_API_BASE=http://localhost:8000 bypasses the Next.js proxy
// (which times out on requests >~30s). In production, leave it unset to use
// the same-origin proxy rewrite defined in next.config.mjs.
const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "") + "/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(optHeaders as Record<string, string> | undefined),
    },
    ...restOptions,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const err = new Error(body.message || body.detail || res.statusText) as Error & {
      status: number;
      body: unknown;
    };
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export function submitAnalysis(body: AnalysisRequest): Promise<AnalysisResponse> {
  return request<AnalysisResponse>("/analysis", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function refineAnalysis(
  analysisId: string,
  body: RefineRequest,
  sessionToken: string
): Promise<RefineResponse> {
  return request<RefineResponse>(`/analysis/${analysisId}/refine`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "X-Session-Token": sessionToken },
  });
}

export function saveAnalysis(
  analysisId: string,
  body: SaveRequest
): Promise<SaveResponse> {
  return request<SaveResponse>(`/analysis/${analysisId}/save`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listAnalyses(): Promise<AnalysisListResponse> {
  return request<AnalysisListResponse>("/analysis");
}

export function deleteAnalysis(analysisId: string): Promise<void> {
  return request<void>(`/analysis/${analysisId}`, { method: "DELETE" });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function requestMagicLink(body: MagicLinkRequest): Promise<MagicLinkResponse> {
  return request<MagicLinkResponse>("/auth/magic-link", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteSession(): Promise<void> {
  return request<void>("/auth/session", { method: "DELETE" });
}
