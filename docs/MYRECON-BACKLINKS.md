# MyRecon ↔ BugSnaps links

MyRecon (`https://www.myrecon.xyz/`, repo `4ryanwalia/Myrecon`) is an
independent product and site. This file records what each side links to, and
the exact additions MyRecon still needs - it lives in another repository, so it
isn't changed from here.

## BugSnaps → MyRecon (done, in this repo)

All links use the canonical `https://www.myrecon.xyz/` (the apex
`myrecon.xyz` 308-redirects there; linking the final URL avoids a hop).

- Navbar: "MyRecon ↗" on every page
- Homepage hero: "Explore MyRecon" (secondary CTA); homepage Products section
- Footer: "MyRecon - reconnaissance", plus the brand line on every page
- `/products`: MyRecon card and `ItemList` structured data
- `/about`: reconnaissance paragraph
- `/personal`: existing "Open myrecon.xyz" link
- Organization JSON-LD `sameAs` includes `https://www.myrecon.xyz/`

## MyRecon → BugSnaps (already present)

`about.html`, `services.html`, `contact.html` and `founder.html` link to
`https://bugsnaps.in`, and `founder.html` has `worksFor: BugSnaps` in its
schema. Good - but none of it is sitewide.

## MyRecon → BugSnaps (to add)

### 1. A sitewide footer link

In the footer of every hand-written page (`frontend/*.html`, 16 files) **and**
in the page templates of the generators (`scripts/build-breaches.js`,
`scripts/build-case-files.js`), change the bottom line:

```html
<span>&copy; 2026 MyRecon · myrecon.xyz</span>
```

to:

```html
<span>&copy; 2026 MyRecon · myrecon.xyz · A <a href="https://bugsnaps.in/" style="color:var(--text-dim)">BugSnaps</a> product</span>
```

Plain `<a href>` (no `nofollow`, no JavaScript) so it is crawlable.

Optionally add a "Company" footer-column entry:

```html
<a href="https://bugsnaps.in/">BugSnaps</a>
```

### 2. Parent organization in the homepage schema

In `frontend/index.html`, inside the `Organization` object of the JSON-LD
`@graph`, add:

```json
"parentOrganization": {
  "@type": "Organization",
  "@id": "https://bugsnaps.in/#organization",
  "name": "BugSnaps",
  "url": "https://bugsnaps.in"
}
```

The `@id` matches the Organization node BugSnaps publishes, so search engines
can join the two.

### 3. Canonical host for BugSnaps links

Link `https://bugsnaps.in/` (apex). `www.bugsnaps.in` now 308-redirects to it.

## Keep checking

- `https://myrecon.xyz` → 308 → `https://www.myrecon.xyz/` (verified 2026-09-23)
- `https://www.bugsnaps.in/*` → 308 → `https://bugsnaps.in/*` (after this release)
