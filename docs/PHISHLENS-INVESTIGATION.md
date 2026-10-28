# PhishLens investigation workspace

The October 2026 upgrade adds analyst workflows without presenting pattern checks as a full website scanner.

## Available workflows

- Single-link review accepts HTTP(S), bare domains and common defanged indicators. Refanging changes only the scheme and authority. No destination is opened.
- Public Suffix List parsing (`tldts`, private suffixes enabled) separates tenant domains, public suffixes and subdomains. This is a boundary, not ownership verification.
- Batch triage accepts at most 100 links, groups exact normalized duplicates and prioritizes local warning signals and provider listings. Invalid inputs remain visible. External submission is a separate action that sends eligible unique hostnames only.
- PhishDestroy enrichment provides bounded registration, infrastructure, prediction and related-indicator fields. Each observation is attributed. Related indicators are defanged text, never navigable links. Shared infrastructure is not evidence of shared operators.
- The combined assessment preserves positive observations when endpoints disagree. Missing, failed and unperformed checks are not clean results. Listing and enrichment share one provider and must not be counted as independent sources.
- JSON and Markdown exports include check outcomes, timestamps, source health and missing coverage. Original input, full URLs, credentials, paths, query strings and fragments are excluded. Hostnames and provider evidence remain and may be sensitive.
- Inputs and results stay in component memory; there is no history database, account upload or localStorage persistence.

## Provider contract and operational constraints

The adapter uses the [PhishDestroy documented API](https://api.destroy.tools/openapi.json): `/v1/check`, `/v1/check/bulk`, `/v1/investigate` and `/v1/health`. Hostnames and browser IPs reach that provider only after an explicit button action. Enrichment can cause provider DNS and registry RDAP requests. Existing Cloudflare DNS checking remains independent and opt-in.

Requests omit credentials and referrers, reject redirects, enforce deadlines and cap JSON bodies at 512 KiB before parsing. Results must match the requested hostname; bulk object keys are validated as the documented domain identity. UI cooldowns honor `Retry-After`; provider-enforced per-IP quotas still apply across users behind a shared network. There are no automatic retries, background scans or uptime guarantees.

Live contract checks on 28 October 2026 returned usable bulk results for `example.com` / `www.example.com`, and registration plus two IP observations for the owner's `bugsnaps.in` domain. The bulk CORS preflight allowed POST and Content-Type from browsers. PhishDestroy reported **degraded** freshness at validation time; that status is surfaced rather than treated as healthy. These checks verify integration, not threat-detection accuracy.

## Validation

Run the four offline checks:

```text
node scripts/check-phishing-detector.cjs
node scripts/check-phishlens-dns.cjs
node scripts/check-phishdestroy.cjs
node scripts/check-phishlens-investigation.cjs
```

The investigation suite covers domain boundaries (including private hosting suffixes), defanged parsing, bounded batches, duplicate grouping, report-secret redaction, contradictory observations, response identity, missing rows, invalid evidence, private-host rejection, network errors, rate limits and oversized responses. Run TypeScript and the Next.js production build as well. UI tab selection supports arrow keys, Home and End.

## Commercial readiness boundaries

This release does not implement isolated page execution, redirect traversal, screenshots, full-URL commercial reputation, continuous brand monitoring, team authentication, billing, signed reports or an SLA. Those capabilities require dedicated infrastructure and additional validation. An API wrapper and regression fixtures do not establish parity with paid detection platforms.

Before making comparative accuracy claims, use an independent, time-split, campaign-separated holdout with reviewed benign and malicious labels, realistic complete URLs, false-positive analysis and documented source permissions. See [the evaluation protocol](PHISHLENS-EVALUATION.md). Never evaluate a provider's coverage against only its own feed and advertise that as accuracy.

Dependencies were patched from `@grpc/grpc-js` 1.9.16 to 1.14.6 (explicit transitive override) and `source-map-js` 1.2.1 to 1.2.2. `npm audit` reported zero known advisories after installation; this is a dependency audit result, not a security certification.
