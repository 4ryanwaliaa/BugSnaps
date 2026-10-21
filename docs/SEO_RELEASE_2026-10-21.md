# Search discovery and useful landing pages

## Changes

- Public navigation and large content directories no longer prefetch every linked page. Click navigation is preserved.
- `_rsc` query variants receive `X-Robots-Tag: noindex`. They remain fetchable, with their cache keys intact, so React navigation is not redirected or blocked.
- The free pentesting landing page and BOLA/IDOR and CI/CD articles use clearer, shorter search snippets. The BOLA introduction now distinguishes the terms without an unsupported prevalence claim.
- The homepage directly describes website and API penetration testing.
- Two new guides provide downloadable API test cases and a blank findings/retest register. They are linked from the homepage, resources, guide collection and related reading.
- Guide dates now render from actual metadata rather than a hardcoded date. Sitemap modification dates change only for edited content.

## Verification

Run `npm run build`, start the production server on port 3100, then run `npm run check:seo`. The audit checks every public sitemap page, unique metadata, canonicals, headings, schema, internal discovery and unknown-route 404 responses. It also verifies the new downloads and that RSC variants remain fetchable as component data.

## Measuring the release

Compare Search Console page and query results over matching 28-day windows, allowing for reporting lag. Look at impressions, clicks, CTR and position together; segment by page, country and device. In Crawl Stats, compare canonical HTML requests with `_rsc` requests. In Page Indexing, distinguish discovered URLs from indexed URLs.

A Lighthouse SEO score measures a limited technical checklist. It does not establish content quality, ranking, traffic or indexing. Google chooses whether and when to crawl and index pages. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

The crawl change is deliberately limited: no blanket query-string robots exclusion, no blocked JavaScript resources, no forced RSC redirects and no synthetic sitemap freshness.
