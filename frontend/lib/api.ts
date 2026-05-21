import { authHeaders } from "./auth";
import type {
  AnalysisDetailResponse,
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

/**
 * SSE variant of `request` for long-running LLM endpoints.
 *
 * Sends `Accept: text/event-stream` so the backend returns an SSE stream
 * with keepalive comments (preventing proxy timeouts) and a final
 * `event: result` carrying the JSON payload.
 */
async function requestSSE<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
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

  // Parse SSE stream — look for "event: result" or "event: error".
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });

    // Check for a complete result event
    const resultIdx = buffer.indexOf("event: result\ndata: ");
    if (resultIdx !== -1) {
      const dataStart = resultIdx + "event: result\ndata: ".length;
      const lineEnd = buffer.indexOf("\n", dataStart);
      if (lineEnd !== -1) {
        return JSON.parse(buffer.slice(dataStart, lineEnd)) as T;
      }
    }

    // Check for an error event
    const errorIdx = buffer.indexOf("event: error\ndata: ");
    if (errorIdx !== -1) {
      const dataStart = errorIdx + "event: error\ndata: ".length;
      const lineEnd = buffer.indexOf("\n", dataStart);
      if (lineEnd !== -1) {
        const { status, detail } = JSON.parse(buffer.slice(dataStart, lineEnd));
        const err = new Error(detail) as Error & { status: number };
        err.status = status;
        throw err;
      }
    }

    if (done) break;
  }

  throw new Error("Stream ended without a result");
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export function submitAnalysis(body: AnalysisRequest): Promise<AnalysisResponse> {
  return requestSSE<AnalysisResponse>("/analysis", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function refineAnalysis(
  analysisId: string,
  body: RefineRequest,
  sessionToken: string
): Promise<RefineResponse> {
  return requestSSE<RefineResponse>(`/analysis/${analysisId}/refine`, {
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

export function getAnalysis(analysisId: string): Promise<AnalysisDetailResponse> {
  return request<AnalysisDetailResponse>(`/analysis/${analysisId}`);
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
