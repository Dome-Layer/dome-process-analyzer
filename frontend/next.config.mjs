import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js App Router requires unsafe-inline for hydration scripts;
              // Mermaid requires unsafe-eval for new Function().
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Tailwind inlines styles; Google Fonts serves a CSS file from googleapis.com.
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Mermaid renders SVG via data URIs; Next.js image optimisation uses blob:.
              "img-src 'self' data: blob:",
              // Direct-mode dev sets NEXT_PUBLIC_API_BASE to a non-same-origin URL;
              // production runs proxy mode (same-origin via the rewrite below) so
              // `connect-src 'self'` is enough.
              `connect-src 'self' https://*.ingest.de.sentry.io${apiBase ? ` ${apiBase}` : ""}`,
              // Google Fonts: CSS from googleapis.com, font files from gstatic.com.
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
              // Disallow embedding in any frame.
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async rewrites() {
    // Production: Vercel serves the frontend and proxies same-origin `/api/*`
    // requests to the Railway backend via BACKEND_PROXY_URL. Frontend code
    // calls `/api/v1/...` as a relative path (NEXT_PUBLIC_API_BASE is unset).
    // Local dev: same proxy setup with BACKEND_PROXY_URL=http://localhost:8000,
    // OR set NEXT_PUBLIC_API_BASE=http://localhost:8000 to bypass the proxy
    // entirely (frontend calls localhost directly) — useful for the analysis
    // endpoint which exceeds Next.js dev-server's proxy timeout.
    const backendUrl = process.env.BACKEND_PROXY_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableSourceMapUpload: true,
});
