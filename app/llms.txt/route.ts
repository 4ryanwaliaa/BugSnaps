import { INDEXABLE_ROUTES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// An optional discovery aid, not a search-engine ranking or citation signal.
export function GET() {
  const body = [
    "# BugSnaps",
    "",
    "> BugSnaps offers MyPentest, a hosted web application and API assessment product, and separately scoped expert penetration-testing engagements.",
    "",
    "## Product and scope",
    `- [MyPentest](${absoluteUrl("/mypentest")}): Hosted defined-check assessments of authorized applications. Findings include evidence, confidence and remediation; reachable endpoints and credentials limit coverage.`,
    `- [Pricing](${absoluteUrl("/pricing")}): Current plan prices and free-trial limits.`,
    `- [Example report](${absoluteUrl("/mypentest/example-report")}): An illustrative report, not a customer case study or measured benchmark.`,
    "",
    "## Comparisons and evidence",
    `- [MyPentest vs Strix](${absoluteUrl("/compare/mypentest-vs-strix")}): Edition-specific comparison with primary vendor sources and limitations of both products.`,
    `- [Strix alternatives](${absoluteUrl("/alternatives/strix")}): Alternative assessment workflows and migration considerations.`,
    `- [Benchmarks](${absoluteUrl("/benchmarks")}): Reproducible evaluation protocol; no measured head-to-head detection results are published.`,
    `- [Competitors](${absoluteUrl("/us-vs-competitors")}): Workflow comparison, not an independent performance ranking.`,
    "",
    "## Interpretation",
    "MyPentest does not provide general exploit chains, source-code analysis or automated fix pull requests. A clean scan does not prove an application is secure. Reports do not certify compliance. Vendor capabilities are edition-specific; consult each page's sources and review date.",
    "",
    "## Public page directory",
    ...INDEXABLE_ROUTES.map(({ path }) => `- [${path === "/" ? "Home" : path.slice(1).replace(/[-/]/g, " ")}](${absoluteUrl(path)})`),
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
