# BugSnaps search intent and SEO changes — 8 November 2026

## Evidence and limits

This is qualitative keyword research from current search results, competing product pages and primary security sources. It is not Google Trends time-series data, Keyword Planner volume, keyword difficulty or a Search Console performance export. No increase in impressions, ranking, clicks or CTR is established by these edits.

Verizon's 2026 DBIR identifies vulnerability exploitation as the leading initial access vector in its dataset, at 31% versus 20% the previous year. This supports prioritizing vulnerability assessment and remediation content; it does not measure demand for any particular keyword.

- Verizon: https://www.verizon.com/business/resources/Td15/reports/2026-dbir-data-breach-investigations-report.pdf
- OWASP API Top 10: https://api-security.owasp.org/editions/2023/en/0x11-t10/
- OWASP BOLA testing guidance: https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/12-API_Testing/02-API_Broken_Object_Level_Authorization/

Search results for website vulnerability scanners emphasize free entry, clear coverage and actionable results. Phishing tool results use both “link checker” and “URL checker,” often answering whether a link is safe. Our pages should explain what the actual tools do and their limits.

Examples inspected through current search results (vendor positioning, not independent endorsements):

- https://secscanner.app/vulnerability-scanner
- https://sectest.salloq.com/
- https://www.malwarebytes.com/scam-check/link
- https://aware.eccouncil.org/phishing-url-checker

## Keyword ownership

| Page | Primary intent | Supporting phrases | Change |
| --- | --- | --- | --- |
| `/` | website security testing | API pentesting, automated website security checks | Clearer title and description; visible task-based links to four products/services |
| `/mypentest` | website vulnerability scanner | automated security checks, vulnerability scanning vs penetration testing | Query-first title and H1; scope explanation and links to comparison, checklist and plan limits |
| `/api-security-testing` | API security testing | REST, GraphQL, BOLA, IDOR, tenant isolation | Specific title, description, H1 and opening explanation |
| `/phishing-detector` | free phishing link checker | suspicious URL checker, check a link without opening it, HTTPS phishing | Aligned title and H1; visible questions and matching FAQ structured data |
| `/endpointradar` | free Windows security posture scanner | read-only endpoint assessment, device reports | Refined title and description; retained the newer free-scanner H1 and WinRM capabilities |
| `/pricing` | penetration testing pricing | MyPentest free scan, paid scan plans, manual pentest quote | Shorter, clearer title and description; existing prices retained |

The existing `/free-ai-pentesting`, `/website-pentesting-ai` and `/ai-penetration-testing` pages retain their established intent. No new near-duplicate landing pages were created. Existing API test-case and scanner-comparison resources receive contextual links.

## Search presentation

Keywords are placed in visible copy, headings, descriptive links and page metadata. No meta-keywords tag was added: Google does not use it for web ranking. Titles remain descriptive and page-specific; social metadata continues to use the shared metadata builder. FAQ schema describes the same answers readers can see and is not a promise of FAQ rich results. Only the six edited public pages receive updated sitemap modification dates.

- Google title guidance: https://developers.google.com/search/docs/appearance/title-link
- Google on meta keywords: https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag

## Measurement after publication

In Search Console, compare each changed page and its query cluster over comparable 28-day periods after recrawling. Record impressions, clicks, CTR and average position, separating country and device when there is sufficient traffic. A position or query-mix change can affect CTR independently of the snippet. Watch successful assessment starts and useful tool engagement as well as clicks. Google's chosen title and snippet may differ from the supplied metadata.

Implementation does not itself verify publication, recrawling or performance gains. Validation results are recorded separately with the rendered-page audit.

The release is based on current `main` and retains its newer PhishLens optional investigation checks and EndpointRadar features. FAQ copy now distinguishes local checks from optional external checks. The SEO audit also verifies that the EndpointRadar workspace stays `noindex` and excludes application routes from sitemap eligibility.

The local MyPentest tutorial draft is preserved separately. Its referenced media files are missing, so its proposed sitemap entry is withheld from this SEO deployment.

## Initial validation on the older local checkout

- `npx tsc --noEmit`: passed.
- `npm run build`: passed after the final source changes; 232 static pages generated. The earlier build logged external fetch timeouts but completed using the existing fallback behavior.
- `node scripts/check-seo.cjs --base http://localhost:3118 --report branding/seo/seo-local-2026-11-08.json`: passed for all 219 indexable public pages, including sitemap inventory, unique metadata, canonical URLs, headings, structured data, visible FAQ parity, internal discovery and unknown-route 404s.
- `node --check scripts/check-seo.cjs` and whitespace checks: passed.

These initial checks predate synchronization. Release validation and deployment are recorded separately after testing the current-main implementation.

## Release validation on latest main

Based on `b411ea46a1b2338e72b1708d2c821a74b0d4d21d`. TypeScript, guide inventory (280 guides / 460 public URLs), payment checks, production build (476 generated pages), and the complete 460-page rendered SEO audit passed. Deployment and live checks are reported in the release follow-up.
