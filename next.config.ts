import type { NextConfig } from "next";

/*
 * Security headers — Roadmap §11 "Production hardening: strict security
 * headers/CSP, HTTPS-only" and §11 "Security-by-design principles".
 *
 * Implemented natively in Next.js (App Router) via `headers()` rather than
 * in `vercel.json` so the policy lives next to the app and travels with it.
 *
 * Future hardening (later SUB-PR): switch CSP to nonce-based via Routing
 * Middleware once we have dynamic surfaces (auth/account) — this gets rid of
 * `'unsafe-inline'`. For now we ship a strict-but-pragmatic CSP that does not
 * break Next.js' static rendering or Turbopack dev.
 */

const isDev = process.env.NODE_ENV !== "production";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  // 'unsafe-eval' is dev-only (Turbopack HMR uses eval). Production CSP drops it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind/Next inject runtime style tags; tighten later via nonces.
  "style-src 'self' 'unsafe-inline'",
  // Dev needs ws/wss for HMR; prod allows https (extended explicitly when integrations land).
  `connect-src 'self'${isDev ? " ws: wss:" : " https:"}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  // X-Frame-Options is a legacy mirror of `frame-ancestors 'none'` for older agents.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
  // HSTS is HTTPS-only and would lock localhost out of plain HTTP if cached,
  // so only emit it in production deployments (Vercel terminates TLS for us).
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to every route, including the root path.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
