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
              // Mermaid uses new Function() internally — unsafe-eval is required.
              "script-src 'self' 'unsafe-eval'",
              // Tailwind injects inline styles.
              "style-src 'self' 'unsafe-inline'",
              // Mermaid renders SVG via data URIs; Next.js image optimisation uses blob:.
              "img-src 'self' data: blob:",
              // Allow XHR/fetch to the Railway backend.
              `connect-src 'self'${apiBase ? ` ${apiBase}` : ""}`,
              // Google Fonts loaded by Next.js font optimisation.
              "font-src 'self' https://fonts.gstatic.com",
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
