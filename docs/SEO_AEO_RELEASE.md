# Public search content expansion

This release expands the BugSnaps/MyPentest public website with security guides, application-specific workflows, sourced product comparisons, alternatives selection guides, a resource hub and a human-readable site map.

The owning repository is `4ryanwaliaa/BugSnaps`, with canonical origin `https://bugsnaps.in`. The private assessment application and API remain excluded from the public sitemap and retain their indexing restrictions.

## Content and answer structure

New pages give a direct answer before the detailed workflow. Guides explain the issue, checks, evidence and limitations. Use cases identify the relevant assets and user roles. Comparisons use vendor documentation, source links and review dates; unknown capabilities are not reported as absent. Alternatives pages explain selection criteria and complementary tools rather than repeating a feature matrix.

Visible FAQs and corresponding structured data use the same question and answer text. Article dates describe the publication or substantive content review. Breadcrumbs and internal links connect every published route to the resource hubs and site map. Metadata includes a unique title, description, canonical URL and social card.

## Discovery

`lib/routes.ts` is the public route registry. `app/sitemap.ts` combines it with the blog registry. Substantive review dates are stored explicitly; unchanged pages no longer get a new date simply because the site is rebuilt. Pages without a known substantive modification date omit `lastmod`.

`/robots.txt` advertises `https://bugsnaps.in/sitemap.xml`. `/site-map` provides public HTML links. Sitemap priority and change frequency are retained as existing descriptive fields; they are not ranking controls.

Google's guidance emphasizes crawlable content, internal links, accurate structured data and useful information for generative search. These changes do not establish that a page is indexed, ranked, cited by an answer engine or eligible for a particular rich result. No automated sitemap ping or search-account submission is claimed.

Sources: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google scaled-content policy](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content).

## Verification

```powershell
npx tsc --noEmit
npm run build
node node_modules/next/dist/bin/next start --port 3100
# In a separate terminal:
node scripts/check-seo.cjs --base http://localhost:3100 --report seo-audit.json
```

The audit fetches every public route and checks HTTP status, sitemap membership, canonical URL, distinct title and description, social metadata, one H1, valid JSON-LD, visible FAQ agreement, internal links and unknown-route 404 behavior. The GitHub workflow runs the same checks after a production build and retains the report.

## Release validation on 2 October 2026

The release adds 64 public URLs: 24 guides and their hub, 12 use cases and their hub, eight named comparisons, 15 alternatives guides and their hub, a resources hub and an HTML site map. The public sitemap now contains 96 URLs.

TypeScript and the production build passed. The HTTP audit passed all 96 public pages and four unknown-slug 404 cases. Representative resources, guide, SaaS use-case, alternatives and comparison pages were checked in Chrome; guide, use-case and alternatives layouts fit the mobile viewport without page overflow. The rendered Plus comparison price was verified as a one-time payment for two scans, with no recurring monthly wording.

The release includes a GitHub workflow to repeat the build and public-page audit. Deployment is through the repository's existing Vercel integration; the deployed commit and live audit are verified separately after publication. Search indexing and answer-engine citations are not established by these checks.

Payment account configuration and the earlier private scanner work are separate from this public content release.
