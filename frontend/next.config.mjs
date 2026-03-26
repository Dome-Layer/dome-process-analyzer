/** @type {import('next').NextConfig} */
const nextConfig = {
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
