import type { NextConfig } from "next";

/*
 * Security headers, redirects and canonical-host handling.
 * These only take effect on hosts that run next.config.ts (Vercel,
 * `next start`, self-hosted Node). If the site ever moves to a static export
 * behind a CDN, mirror them in the host's config.
 */
// next dev needs eval() (source maps, react-refresh) and a WebSocket for
// HMR; neither relaxation ships to production.
const isDev = process.env.NODE_ENV === "development";

// Local development against the Firebase Auth emulator (optional).
const authEmulator = isDev ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR?.trim() : undefined;

/** The canonical host. www.bugsnaps.in answers with a permanent redirect here. */
const CANONICAL_HOST = "bugsnaps.in";

function csp(extra: { script?: string[]; connect?: string[]; frame?: string[] } = {}) {
  return [
    "default-src 'self'",
    // 'unsafe-inline' for script/style is required by Next.js App Router
    // hydration on statically rendered pages (a nonce-based CSP would force
    // every page to render dynamically).
    ["script-src 'self' 'unsafe-inline'", ...(extra.script ?? []), isDev ? "'unsafe-eval'" : ""]
      .join(" ")
      .trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    ["connect-src 'self' https://api.web3forms.com", ...(extra.connect ?? []), isDev ? "ws:" : ""]
      .join(" ")
      .trim(),
    "object-src 'none'",
    extra.frame?.length ? `frame-src ${extra.frame.join(" ")}` : "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = [
  // Everything is same-origin; the only external call is the contact-form
  // relay. If a Cal.com/Calendly embed is added later, allow its origin in
  // frame-src and connect-src here.
  { key: "Content-Security-Policy", value: csp() },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
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

/*
 * MyPentest signs people in with Firebase (Google, GitHub, email) and keeps
 * their history in the Realtime Database. Only the app (/mypentest/app) gets the
 * origins that needs — Identity Toolkit and token endpoints, Google's gapi
 * loader, the project's auth-handler frame, the database hosts — and a COOP
 * that lets the sign-in popup report back (with "same-origin" the popup is cut
 * off from the page and sign-in never completes). The MyPentest engine itself
 * is reached through /mypentest/api on this origin, so it needs no entry.
 */
const firebase = {
  script: ["https://apis.google.com", "https://*.firebaseio.com", "https://*.firebasedatabase.app"],
  connect: [
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://www.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.firebasedatabase.app",
    "wss://*.firebasedatabase.app",
    ...(authEmulator ? [authEmulator.replace(/\/$/, "")] : []),
  ],
  frame: ["https://mypentest-bugsnaps.firebaseapp.com", "https://*.firebaseio.com", "https://*.firebasedatabase.app"],
};

const mypentestHeaders = [
  { key: "Content-Security-Policy", value: csp(firebase) },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/mypentest/app", headers: mypentestHeaders },
      { source: "/mypentest/app/:path*", headers: mypentestHeaders },
      // The signed-in app is never indexed, whatever a crawler finds linking to it.
      { source: "/mypentest/app/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/mypentest/app", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      // One canonical host. (If the Vercel dashboard is ever set to redirect
      // the apex to www instead, delete this rule, or the two will loop.)
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${CANONICAL_HOST}` }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
      // The old homepage sections (#services, #pricing, #contact …) were
      // fragments, which never reach the server; LegacyHashRedirect on the
      // homepage forwards them to their new pages in the browser.
    ];
  },
};

export default nextConfig;
