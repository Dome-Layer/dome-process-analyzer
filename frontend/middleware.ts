import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Per-request nonce-based Content-Security-Policy.
//
// Replaces the static `script-src 'unsafe-inline' 'unsafe-eval'` that used to
// live in next.config.mjs. With a per-request nonce, an injected inline script
// cannot execute — so the CSP is a real XSS backstop for the JS-readable
// cross-subdomain SSO session token (see SECURITY.md).
//
// 'unsafe-eval' is KEPT here: Mermaid uses new Function() to render diagrams.
// Dropping 'unsafe-inline' (the inline-script-injection vector) is the
// security-critical change; 'unsafe-eval' only permits eval() from already
// same-origin-trusted code and does not enable script injection.
//
// Next.js reads the nonce from the request's Content-Security-Policy header and
// applies it to its own bootstrap/hydration scripts automatically; our inline
// theme script in app/layout.tsx reads it from the `x-nonce` request header.
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    `connect-src 'self' https://*.ingest.de.sentry.io${apiBase ? ` ${apiBase}` : ""}`,
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next static assets and the proxied API, which
    // don't execute scripts and don't need a per-request CSP.
    "/((?!_next/static|_next/image|api/|favicon.ico|favicon.svg|favicon.png|favicon-64.png|apple-touch-icon.png).*)",
  ],
};
