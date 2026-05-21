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
 *
 * Falls back to plain-JSON parsing when the reverse-proxy strips the
 * Accept header and the backend returns a normal JSON response.
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

  // Read the full body and normalise line endings so the SSE field
  // matching below works regardless of proxy line-ending rewriting.
  const raw = (await res.text()).replace(/\r\n?/g, "\n");

  // --- SSE parsing ---------------------------------------------------
  // Events are delimited by blank lines.  Each event can carry field
  // lines like "event: <type>" and "data: <payload>".
  for (const block of raw.split("\n\n")) {
    let type = "";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) type = line.slice(6).trim();
      else if (line.startsWith("data:")) data = line.slice(5).trimStart();
    }
    if (type === "result" && data) return JSON.parse(data) as T;
    if (type === "error" && data) {
      const payload = JSON.parse(data);
      const err = new Error(payload.detail) as Error & { status: number };
      err.status = payload.status;
      throw err;
    }
  }

  // --- Fallback: plain JSON ------------------------------------------
  // If the reverse-proxy stripped the Accept header the backend returns
  // a normal JSON response instead of SSE.
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // not valid JSON — fall through
    }
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
