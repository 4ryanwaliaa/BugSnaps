import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { SECURITY_GUIDES, guidePath } from "@/lib/security-guides";
import { SECURITY_USE_CASES, useCasePath } from "@/lib/security-use-cases";
import { ALTERNATIVE_PAGES, alternativePath } from "@/lib/alternatives";
import { competitors, versusPath } from "@/lib/competitors";
import { posts } from "@/lib/blog";
import { INDEXABLE_ROUTES } from "@/lib/routes";
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
  ["/us-vs-competitors", "BugSnaps vs Competitors: Sector Benchmarks & Accuracy"],
  ["/benchmarks", "Offensive Security Benchmarks: Accuracy & Trust"],
  ["/security-readiness", "World-Ready Security & Trust Center"],
  ["/solutions/saas-penetration-testing", "SaaS Penetration Testing"],
  ["/solutions/fintech-penetration-testing", "Fintech Penetration Testing"],
  ["/solutions/startup-penetration-testing", "Startup Penetration Testing"],
  ["/solutions/soc2-penetration-testing", "SOC 2 Penetration Testing"],
  ["/solutions/api-penetration-testing", "API Penetration Testing"],
  ["/myrecon", "MyRecon: OSINT & Attack Surface Intelligence"],
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

const paths = [...INDEXABLE_ROUTES.map((r) => r.path), ...posts.map((p) => `/blog/${p.slug}`)];
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
        <a href="/sitemap.xml" className="text-sm text-accent hover:underline">
          Open the XML sitemap
        </a>
        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
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
