# Crawl and sitemap review — October 22, 2026

## Evidence and limits

Search Console was read earlier in this work session. The crawl report was last updated October 20: 5.64K requests, 128 ms average response, no host problems, HTTP 200 rounded to 100%, 404 and redirects each below 1%. The purpose breakdown was 95% refresh / 5% discovery. File type was 86% Other / 7% HTML / 6% JavaScript. Other contained 4.84K requests; its ten most recent displayed examples were October 15 `_rsc` navigation-resource URLs, not ten distinct HTML page crawls.

The sitemap report showed Success, last read October 20, and 177 discovered URLs before the October 22 release added two guides. The submitted sitemap was accepted again October 22; acceptance is not a new crawl or indexing receipt. The indexing report, last updated October 12, showed 153 indexed and 23 Discovered - currently not indexed, plus two redirects. These are differently dated reports, not a simultaneous funnel.

Interpretation: the earlier large request count was dominated by rendering/navigation resources. A lower total does not establish that useful HTML crawling stopped. The existing evidence does not show an availability failure or broken sitemap. It does not establish the exact cause or date of the apparent drop. Browser access was disabled when attempting to inspect the latest daily/HTML timeline; a fresh report or verified Googlebot access logs are still needed for that conclusion. Do not attribute an earlier October drop to fixes deployed October 22.

## Current public checks

October 22 HTTP probes using a Googlebot smartphone user-agent returned 200 for robots.txt, sitemap.xml, homepage and /alternatives/invicti. Public HTML had no noindex; sitemap contained 179 URLs. HTTP and www homepage variants redirected with 308 to the canonical HTTPS hostname. A spoofed user-agent probe tests response behavior only; it is not a real Googlebot fetch.

## Changes

- XML and HTML maps now share one public URL inventory.
- XML retains canonical URLs and genuine modification dates; the blog listing inherits the latest article update. Unknown dates remain omitted. Removed priority/change-frequency fields, which Google ignores.
- HTML directory includes topic jump links, counts and six recently updated guides/articles. Every page remains linked in server-rendered HTML with prefetch disabled.
- SEO audit now verifies exact source modification dates, rejects future dates, verifies every XML URL is in the HTML directory, and traverses links from the homepage to detect disconnected groups of pages. Reports include maximum click depth.
- Kept the existing /sitemap.xml address and 179 useful pages. No artificial page multiplication or timestamp refresh.

## Remaining measurement

When Search Console is accessible, compare daily HTML requests with Other requests around October 15; inspect host availability over the same dates; inspect representative Discovered URLs and the newly added guides. If actual HTML requests remain zero beyond reporting delay, compare verified Googlebot server logs and Vercel firewall events. Compare clicks and CTR over equal periods by query, page and position after Google recrawls the title changes. A sitemap cannot force crawling, indexing or rank.

Sources: https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors and https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
