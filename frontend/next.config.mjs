/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";
    const authBackend = process.env.NEXT_PUBLIC_AUTH_BACKEND ?? "";
    // Collect distinct non-empty backend origins for connect-src
    const backendOrigins = [...new Set([apiBase, authBackend].filter(Boolean))].join(" ");
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
              // Allow XHR/fetch to Railway backend (NEXT_PUBLIC_API_BASE and/or NEXT_PUBLIC_AUTH_BACKEND).
              `connect-src 'self'${backendOrigins ? ` ${backendOrigins}` : ""}`,
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
    // Only used when NEXT_PUBLIC_API_BASE is not set (local dev without direct backend URL).
    // In production, NEXT_PUBLIC_API_BASE points directly to the Railway backend.
    const backendUrl = process.env.BACKEND_PROXY_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
