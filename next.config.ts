import type { NextConfig } from "next";

/*
 * Security headers, sent on every route.
 * These only take effect on hosts that run next.config.ts (Vercel,
 * `next start`, self-hosted Node). If the site ever moves to a static
 * export behind a CDN, mirror these in the host's header config.
 */
// next dev needs eval() (source maps, react-refresh) and a WebSocket for
// HMR; neither relaxation ships to production.
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    // 'unsafe-inline' for script/style is required by Next.js App Router
    // hydration on statically rendered pages (a nonce-based CSP would force
    // every page to render dynamically). Everything else is locked to
    // same-origin; the only permitted external call is the contact-form
    // relay. If a Cal.com/Calendly embed is added later, allow its origin
    // in frame-src and connect-src.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      `connect-src 'self' https://api.web3forms.com${isDev ? " ws:" : ""}`,
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
