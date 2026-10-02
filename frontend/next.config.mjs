import { withSentryConfig } from "@sentry/nextjs";

/**
 * A static export (Sprint H phase 2): Cloudflare serves out/ as static assets and the Worker in
 * worker/ adds the per-request CSP nonce and the security headers (worker/site.ts), proxies
 * /api/* to the backend (it was the rewrite here), and serves /saved/<id> from one prebuilt
 * shell. Nothing here may need a server at request time.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableSourceMapUpload: true,
});
