# BugSnaps — Find. Fix. Fortify.

The BugSnaps website (bugsnaps.in): the company, its products — **MyPentest**
(automated penetration testing, hosted here at `/mypentest`) and **MyRecon**
(reconnaissance, its own site at myrecon.xyz) — and its expert-led services.

## Stack

- **Next.js 15** (App Router) + **TypeScript**, statically rendered except the MyPentest API proxy
- **Tailwind CSS v4** — design tokens in `app/globals.css`
- **Firebase Auth + Realtime Database** (client SDK, lazy-loaded) — MyPentest sign-in and history
- **Lucide** icons; Framer Motion only on `/personal`

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Where things live

| What | File |
| --- | --- |
| Site URL, org details, metadata builder, JSON-LD helpers | `lib/site.ts` |
| Product line (nav, footer, /products, homepage) | `lib/products.ts` |
| **Pricing and plans — the only place prices/limits are defined** | `lib/plans.ts` |
| Indexable pages → sitemap | `lib/routes.ts` (+ blog posts from `lib/blog.ts`) |
| Service pages content | `lib/services.ts` → `components/site/service-page.tsx` |
| Comparison pages content | `lib/compare.ts` → `components/site/compare-page.tsx` |
| Blog posts | `lib/blog.ts` |
| MyPentest routes and helpers | `lib/mypentest.ts`, `lib/mypentest/*` |
| Security headers, CSP, canonical-host redirect | `next.config.ts` |

## Pages

`/` (short homepage) · `/mypentest` · `/mypentest/example-report` · `/products` ·
`/pricing` · `/services` · `/penetration-testing` · `/web-application-pentesting` ·
`/api-security-testing` · `/network-pentesting` · `/compare` (+3 comparisons) ·
`/blog` (+posts) · `/about` · `/contact` · `/careers` · `/personal` · legal pages.

The signed-in app is `/mypentest/app` (dashboard), `/mypentest/app/new`
(target → DNS verification → configure → start) and
`/mypentest/app/assessment?id=…` (live progress, attack surface, report,
exports). It is `noindex`, `X-Robots-Tag: noindex`, and disallowed in robots.txt.

Old homepage anchors (`/#services`, `/#pricing`, `/#contact` …) are forwarded
to their new pages in the browser (`components/home/legacy-hash-redirect.tsx`).
Domain Intelligence was removed; `/api/domain-intel` is gone (404).

## MyPentest integration

The browser never holds a scanner key. It signs in with Firebase and calls
`/mypentest/api/*` with its ID token; `app/mypentest/api/[...path]/route.ts`
forwards allowlisted paths to the engine, which verifies the token itself.

| Env var (Vercel) | Scope | Meaning |
| --- | --- | --- |
| `MYPENTEST_ENGINE_URL` | server only | The hosted engine, e.g. `https://mypentest-api.onrender.com`. Unset → the API answers 503 "not connected". |
| `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR` | dev only | Optional Firebase Auth emulator origin for local testing. |

Engine deployment, Firebase console steps and the security model are in the
scanner repository: `docs/MYPENTEST_HOSTED.md`.

The example report (`lib/mypentest/example-report.json`) is real engine output
from a scan of BugSnaps' own deliberately vulnerable test app, with the host
renamed and query strings/evidence removed. It is labelled as an example
everywhere it appears.

## SEO

Every indexable page uses `pageMetadata()` for a unique title, description,
canonical (`https://bugsnaps.in/...`), Open Graph and Twitter card.
Structured data: Organization + WebSite (layout), SoftwareApplication (MyPentest),
Service (service pages), FAQPage (only where a visible FAQ exists),
Article (blog), BreadcrumbList (inner pages), ItemList (products).
`www.bugsnaps.in` permanently redirects to `bugsnaps.in` (`next.config.ts`) —
don't also configure the opposite redirect in Vercel, or they will loop.

MyRecon backlinks: see `docs/MYRECON-BACKLINKS.md`.

## Contact form

`components/sections/contact.tsx` submits to Web3Forms (public access key, it can
only send mail to us). `/contact?topic=…` preselects the topic. A honeypot field
filters bots and a `mailto:` fallback covers relay outages.

## Content rules

No fabricated stats, testimonials, customers or logos. Anything not yet built is
labelled "Planned" or "Coming soon". Competitor comparisons describe categories,
never unverified claims about a named product.
