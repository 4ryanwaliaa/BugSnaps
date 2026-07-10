# BugSnaps — Find. Fix. Fortify.

Official website for BugSnaps, an offensive security consultancy for startups, SaaS,
and e-commerce companies.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** — design tokens defined in `app/globals.css`
- **Framer Motion** — scroll reveals, hero parallax, micro-interactions
- **Lucide** icons

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure

```
app/
  layout.tsx                 # Fonts, SEO metadata, JSON-LD
  page.tsx                   # Landing page composition
  globals.css                # Design tokens + shared treatments
  careers/ privacy/ terms/ responsible-disclosure/
components/
  site/                      # Navbar, footer, logo, legal page shell
  sections/                  # One file per landing-page section
  ui/                        # Button, badges, section shell, reveal animations
lib/
  data.ts                    # All site content (services, risks, FAQ, …)
  utils.ts                   # cn() class helper
```

Landing page sections: Hero → Why it matters (plain-words explainer) →
Services → How it works → Sample report → Pricing → FAQ → Contact.

No fabricated stats, testimonials, or case studies — the site is honest
about BugSnaps being a new company. The report and dashboard mockups are
labeled as samples.

## Editing content

All copy lives in [`lib/data.ts`](lib/data.ts) — services, risks, process
steps, and FAQ entries are plain typed arrays. Edit there; no component
changes needed.

## Contact form

`components/sections/contact.tsx` submits to Web3Forms, which relays messages
to the BugSnaps inbox. The access key in that file is public by design — it
can only be used to send mail *to us* — and is managed at web3forms.com.
A honeypot field (`botcheck`) filters bot submissions, and a `mailto:`
fallback covers relay outages. When online booking is ready, drop a
Cal.com/Calendly embed into the marked placeholder **and** allow the embed
origin in the CSP in `next.config.ts`.

## Security

Security headers (CSP, HSTS, `frame-ancestors`, Permissions-Policy, etc.) are
defined in [`next.config.ts`](next.config.ts). They apply on Vercel and
`next start`; if the site ever moves to a static export behind a CDN, mirror
them in the host's header config. `npm audit` flags a moderate advisory in
the `postcss` copy bundled *inside* Next.js — it's build-time-only tooling
that never processes untrusted CSS here, and no non-canary Next release has
the patched version yet; accepted risk, revisit on the next Next.js upgrade.

## Design system

| Token        | Value     |
| ------------ | --------- |
| Background   | `#09090B` |
| Surface      | `#111113` |
| Primary      | `#2563EB` |
| Accent       | `#3B82F6` |
| Foreground   | `#FAFAFA` |
| Muted        | `#A1A1AA` |

Green (`#22C55E`) is reserved for success states. Severity colors
(critical/high/medium/low) are used only inside report-style UI.
