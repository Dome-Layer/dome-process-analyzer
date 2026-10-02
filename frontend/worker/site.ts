/**
 * What is specific to Process Analyzer. The rest of worker/ is the shared tool Worker
 * (dome-docs/templates/tool-worker, Sprint H phase 2), copied unchanged into each tool.
 */

/**
 * The Content-Security-Policy. index.ts puts the per-response nonce in place of {NONCE}.
 * Copied from the middleware it replaces (2026-10-01), which is what production sent.
 * 'unsafe-eval' is kept on purpose: Mermaid renders diagrams with new Function().
 * connect-src needs no backend host: the browser calls /api/* on this origin and the Worker
 * passes it on (PROXY_PREFIXES).
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{NONCE}' 'strict-dynamic' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://*.ingest.de.sentry.io",
  "font-src 'self'",
  "frame-ancestors 'none'",
]

/** Headers on every response (they were in next.config headers()). */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * Dynamic routes, served from one prebuilt page each: /saved/<analysis id> gets the shell
 * /saved/_ (and its client-navigation payloads), and the page reads the id from the URL.
 */
export const SHELL_ROUTES: { prefix: string; shell: string }[] = [{ prefix: '/saved/', shell: '/saved/_' }]

/**
 * Paths passed through to the backend (env.API_ORIGIN, set per environment in wrangler.jsonc):
 * the same-origin API the frontend calls, streaming analyses included. It was a Vercel rewrite.
 */
export const PROXY_PREFIXES: string[] = ['/api/']
