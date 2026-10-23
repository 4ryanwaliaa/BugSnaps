# Google preferred sources

The public BugSnaps footer, blog articles, and security guides link to
https://www.google.com/preferences/source?q=bugsnaps.in using Google's documented
deep-link format. The plain link works with the existing Content Security Policy
and does not load an additional third-party script. Readers confirm their own
selection on Google; clicking the link does not automatically subscribe them.

On 23 October 2026, Google's source-preferences UI returned bugsnaps.in as a
selectable result. This verifies source selection availability, not indexing,
ranking, Discover distribution, or AI citations.

Existing public-page metadata enables large Google image previews and unrestricted
snippets. Robots rules allow Googlebot and search crawlers while excluding the
signed-in application and API. Preserve these exclusions.

Preferred sources can personalize Top Stories and highlight citations in AI Mode
and AI Overviews for readers who select the site. There is no site-wide ranking
guarantee. Discover eligibility is separate and requires indexing and policy
compliance. No special Discover or AI schema is required.

Further editorial work: use original, relevant article images at least 1200 px
wide instead of relying on the shared brand card; maintain accurate bylines,
publication dates, primary references, and substantive updates. Do not relabel
evergreen guides as news or refresh dates without a content change.

After deployment, verify the links on a public page and an article. In Search
Console, verify indexing and Search generative AI inclusion settings, and monitor
actual impressions/clicks. These provider settings and performance outcomes were
not changed or verified by this implementation.

References:
- https://developers.google.com/search/docs/appearance/preferred-sources
- https://developers.google.com/search/docs/appearance/google-discover
- https://developers.google.com/search/docs/appearance/ai-features
