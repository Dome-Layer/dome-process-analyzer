import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
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
          // Content-Security-Policy is set per-request in middleware.ts
          // (nonce-based script-src; 'unsafe-eval' kept for Mermaid's new Function()).
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
