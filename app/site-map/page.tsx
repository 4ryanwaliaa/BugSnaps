import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { SECURITY_GUIDES, guidePath } from "@/lib/security-guides";
import { SECURITY_USE_CASES, useCasePath } from "@/lib/security-use-cases";
import { ALTERNATIVE_PAGES, alternativePath } from "@/lib/alternatives";
import { competitors, versusPath } from "@/lib/competitors";
import { posts } from "@/lib/blog";
import { SITEMAP_PAGES } from "@/lib/sitemap-pages";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Site Map: BugSnaps Security Testing Pages",
  description: "Browse every public BugSnaps product, service, security guide, use case, comparison, benchmark and article from one organized site map.",
  path: "/site-map",
});

const names = new Map<string, string>([
  ...SECURITY_GUIDES.map((g): [string, string] => [guidePath(g.slug), g.title]),
  ...SECURITY_USE_CASES.map((u): [string, string] => [useCasePath(u.slug), u.title]),
  ...ALTERNATIVE_PAGES.map((a): [string, string] => [alternativePath(a.slug), a.title]),
  ...competitors.map((c): [string, string] => [versusPath(c.slug), `MyPentest vs ${c.name}`]),
  ...posts.map((p): [string, string] => [`/blog/${p.slug}`, p.title]),
  ["/", "BugSnaps home"],
  ["/mypentest", "MyPentest"],
  ["/mypentest/example-report", "Example assessment report"],
  ["/guides", "Security guides"],
  ["/use-cases", "Security testing use cases"],
  ["/alternatives", "Security tool alternatives"],
  ["/us-vs-competitors", "BugSnaps vs Competitors: Scope & Evidence"],
  ["/benchmarks", "Pentesting Benchmark Methodology"],
  ["/improvements", "Website Security Improvements and Fix Retesting"],
  ["/why-bugsnaps", "Why Try BugSnaps and MyPentest"],
  ["/compare/mypentest-vs-ai-assistants", "MyPentest vs ChatGPT, Claude and AI Automation"],
  ["/security", "Security & Trust: Data and Infrastructure"],
  ["/security-readiness", "Security Readiness: Scope and Evidence"],
  ["/solutions/saas-penetration-testing", "SaaS Penetration Testing"],
  ["/solutions/fintech-penetration-testing", "Fintech Penetration Testing"],
  ["/solutions/startup-penetration-testing", "Startup Penetration Testing"],
  ["/solutions/soc2-penetration-testing", "SOC 2 Penetration Testing"],
  ["/solutions/api-penetration-testing", "API Penetration Testing"],
  ["/myrecon", "MyRecon: OSINT & Attack Surface Intelligence"],
  ["/endpointradar", "EndpointRadar: Windows Endpoint Security Posture"],
  ["/phishing-detector", "PhishLens: Free Phishing Link Assessment"],
  ["/free-ai-pentesting", "Free AI Penetration Testing"],
  ["/website-pentesting-ai", "AI Website Penetration Testing"],
  ["/ai-penetration-testing", "AI Penetration Testing Platform"],
  ["/continuous-penetration-testing", "Continuous Penetration Testing (PTaaS)"],
  ["/reconnaissance", "Reconnaissance & OSINT Assessments"],
  ["/cloud-penetration-testing", "Cloud Penetration Testing Services"],
]);

const sections = [
  { title: "Product, services and company", test: (p: string) => !/^\/(guides|use-cases|alternatives|compare|blog|solutions)(\/|$)/.test(p) && p !== "/us-vs-competitors" && p !== "/benchmarks" },
  { title: "Solutions and industry security", test: (p: string) => p.startsWith("/solutions") },
  { title: "Security guides", test: (p: string) => p.startsWith("/guides") },
  { title: "Testing use cases", test: (p: string) => p.startsWith("/use-cases") },
  { title: "Comparisons and benchmarks", test: (p: string) => p.startsWith("/compare") || p.startsWith("/alternatives") || p === "/us-vs-competitors" || p === "/benchmarks" },
  { title: "Articles", test: (p: string) => p.startsWith("/blog") },
];

const paths = SITEMAP_PAGES.map((page) => page.path);
const recentPages = SITEMAP_PAGES
  .filter((page) => page.lastModified && page.path !== "/site-map" && /\/(blog|guides)\//.test(page.path))
  .sort((a, b) => b.lastModified!.localeCompare(a.lastModified!) || a.path.localeCompare(b.path))
  .slice(0, 6);
const fallbackName = (p: string) => (p.split("/").filter(Boolean).at(-1) ?? "Home").replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());

export default function SiteMapPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Site map", path: "/site-map" }]}
        eyebrow="Browse BugSnaps"
        title="Find the page you need."
        lead="Every public guide, comparison, use case, benchmark, and service in one place. Search engines can also use our XML sitemap."
      />
      <Section>
        <p className="mb-4 text-muted">Browse {paths.length} public pages by topic, or start with recently updated guides and articles.</p>
        <a href="/sitemap.xml" className="text-sm text-accent hover:underline">
          Open the XML sitemap
        </a>
        <nav aria-label="Site map topics" className="mt-6 flex flex-wrap gap-3">
          {sections.map((section, index) => (
            <a key={section.title} href={`#topic-${index}`} className="rounded-lg border border-border px-3 py-2 text-sm hover:text-accent">
              {section.title} ({paths.filter(section.test).length})
            </a>
          ))}
        </nav>
        <section aria-labelledby="recent-updates" className="mt-8 rounded-xl border border-border p-6">
          <h2 id="recent-updates" className="text-xl font-semibold">Recently updated guides and articles</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {recentPages.map((page) => (
              <li key={page.path}>
                <Link href={page.path} className="text-sm hover:text-accent">{names.get(page.path) ?? fallbackName(page.path)}</Link>
                <p className="mt-1 text-xs text-muted">Updated <time dateTime={page.lastModified}>{page.lastModified}</time></p>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-8 space-y-10">
          {sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`topic-${index}`}>
              <h2 id={`topic-${index}`} className="scroll-mt-24 text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {paths.filter(section.test).map((p) => (
                  <li key={p}>
                    <Link href={p} className="text-sm leading-relaxed text-muted transition-colors hover:text-foreground">
                      {names.get(p) ?? fallbackName(p)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
