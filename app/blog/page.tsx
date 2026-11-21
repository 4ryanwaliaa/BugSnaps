import type { Metadata } from "next";
import Link from "@/components/site/content-link";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { posts, vulnerabilityPosts, type Post } from "@/lib/blog";
import { newAssessmentUrl } from "@/lib/mypentest";
import { blogJsonLd, collectionPageJsonLd, pageMetadata } from "@/lib/site";
import { BlogHub, type BlogHubId, type BlogHubMeta, type BlogHubSummary } from "./blog-hub";

export const metadata: Metadata = pageMetadata({
  title: "Security Blog: Breaches, CVEs & Pentest Guides",
  description:
    "Practical security guides, CVE advisories, breach explainers, and web or API pentesting workflows from BugSnaps—covering OWASP risks and phishing.",
  path: "/blog",
});

const VULN_SLUGS = new Set(vulnerabilityPosts.map((p) => p.slug));
const BREACH_SLUGS = new Set([
  "binance-crypto-hack-october-2026-explained",
  "recent-data-breaches-october-2026",
]);

const DEEPDIVE_SLUGS = new Set([
  "secure-cookie-attributes-and-http-security-headers",
  "bola-idor-api-testing-paired-account-playbook",
  "bola-idor-vulnerability-prevention-guide",
  "ssrf-cloud-metadata-exploitation-prevention",
  "sql-injection-modern-frameworks-guide",
  "cross-site-scripting-xss-defense-modern-web",
  "jwt-security-best-practices-attack-vectors",
  "cors-misconfiguration-data-theft-risks",
  "mass-assignment-parameter-tampering-defense",
  "race-conditions-business-logic-attacks",
  "broken-authentication-session-hijacking",
  "server-side-template-injection-ssti-guide",
  "file-upload-vulnerabilities-webshell-prevention",
  "security-headers-complete-implementation-guide",
  "subdomain-takeover-detection-mitigation",
  "open-redirect-vulnerabilities-oauth-theft",
  "secrets-leakage-in-frontend-javascript",
]);

const ARCHITECTURE_SLUGS = new Set([
  "pentesting-saas-applications-checklist",
  "pentesting-fintech-payment-gateways-guide",
  "pentesting-ecommerce-stores-checkout-flows",
  "pentesting-ai-llm-web-applications",
  "graphql-security-testing-best-practices",
  "microservices-internal-api-attack-surfaces",
  "websocket-security-testing-guide",
  "webhook-security-signature-verification",
  "devsecops-pipeline-penetration-testing",
  "vulnerability-disclosure-policy-vdp-guide",
  "zero-trust-web-application-architecture",
  "dependency-vulnerabilities-and-sbom-management",
  "mobile-backend-api-security-testing",
  "preparing-for-your-first-penetration-test",
  "post-pentest-remediation-and-retesting-workflow",
]);

const MYPENTEST_SLUGS = new Set([
  "why-bugsnaps-mypentest-is-better",
  "zero-false-positives-automated-pentesting",
  "hosted-pentesting-vs-complex-scanner-setups",
  "no-api-keys-no-hallucinations-security-testing",
  "dns-verification-safe-ethical-pentesting",
  "transparent-pricing-vs-enterprise-scanner-lock-in",
  "actionable-remediation-developer-ready-fixes",
  "reconnaissance-meets-penetration-testing",
  "authenticated-web-pentesting-made-simple",
  "automated-dual-account-access-control-testing",
  "hybrid-security-automated-speed-expert-depth",
]);

function classifyPost(post: Post): BlogHubId {
  if (VULN_SLUGS.has(post.slug) || BREACH_SLUGS.has(post.slug)) return "advisories";
  if (post.productId) return "products";
  if (DEEPDIVE_SLUGS.has(post.slug)) return "vulnerabilities";
  if (ARCHITECTURE_SLUGS.has(post.slug)) return "architecture";
  if (MYPENTEST_SLUGS.has(post.slug)) return "mypentest";
  return "strategy";
}

const HUBS: BlogHubMeta[] = [
  {
    id: "advisories",
    title: "Advisories, CVEs & Breaches",
    description: "Incident explainers, React2Shell & framework CVEs, and practical deployment patch verification guides.",
    links: [
      { label: "Vulnerability hub", href: "/vulnerability-guides" },
      { label: "PHP2Shell check", href: "/mypentest/php2shell" },
    ],
  },
  {
    id: "products",
    title: "Endpoints, Phishing & OSINT",
    description: "Hands-on guides for Windows endpoint posture, suspicious link inspection, and digital footprint research.",
    links: [
      { label: "EndpointRadar", href: "/endpointradar" },
      { label: "PhishLens", href: "/phishing-detector" },
      { label: "MyRecon", href: "/myrecon" },
    ],
  },
  {
    id: "vulnerabilities",
    title: "Vulnerability Deep-Dives",
    description: "OWASP Top 10 and API weakness breakdowns—BOLA/IDOR, SSRF, XSS, JWT, CORS, race conditions, and secrets.",
    links: [{ label: "Security guides", href: "/guides" }],
  },
  {
    id: "architecture",
    title: "Architecture & Industry Guides",
    description: "Pentesting checklists for SaaS, fintech, ecommerce, GraphQL, webhooks, DevSecOps, and mobile backends.",
    links: [
      { label: "SaaS & API solutions", href: "/solutions/saas-penetration-testing" },
      { label: "Use cases", href: "/use-cases" },
    ],
  },
  {
    id: "mypentest",
    title: "Automated Pentesting & MyPentest",
    description: "How MyPentest works: DNS verification, authenticated dual-account checks, SARIF exports, and pricing.",
    links: [
      { label: "Explore MyPentest", href: "/mypentest" },
      { label: "Compare tools", href: "/compare" },
    ],
  },
  {
    id: "strategy",
    title: "Pentest Strategy & Compliance",
    description: "Planning SOC 2, ISO 27001, HIPAA, PCI DSS v4.0, startup launches, and engineering ROI.",
    links: [
      { label: "SOC 2 scope", href: "/solutions/soc2-penetration-testing" },
      { label: "Manual services", href: "/services" },
    ],
  },
];

export default function BlogIndex() {
  const sortedPosts = [...posts].sort((a, b) => b.published.localeCompare(a.published));
  const summaries: BlogHubSummary[] = sortedPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    published: post.published,
    readingMinutes: post.readingMinutes,
    hubId: classifyPost(post),
  }));
  const postItems = sortedPosts.map((post) => ({
    name: post.title,
    path: `/blog/${post.slug}`,
  }));

  return (
    <SiteShell>
      <JsonLd
        data={blogJsonLd({
          name: "BugSnaps Security Blog",
          description:
            "Practical security guides, CVE advisories, breach explainers, and web or API pentesting workflows from BugSnaps.",
          path: "/blog",
          items: postItems,
        })}
      />
      <JsonLd
        data={collectionPageJsonLd({
          name: "Security Blog: Breaches, CVEs & Pentest Guides",
          description:
            "Categorized library of BugSnaps advisories, vulnerability deep-dives, industry guides, and pentesting playbooks.",
          path: "/blog",
          items: postItems,
        })}
      />
      <PageHeader
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Security field notes"
        title="Security Blog: Breaches, CVEs & Pentest Guides"
        lead="Clear explanations of recent breaches alongside practical guides to Windows posture, suspicious links, digital footprints, and web vulnerabilities."
      >
        <nav aria-label="Explore security articles" className="flex flex-wrap gap-3">
          <Link href="/vulnerability-guides" className="rounded-full border border-accent/30 px-5 py-3 text-sm font-medium text-accent hover:border-accent">
            React2Shell &amp; framework vulnerability hub
          </Link>
          <a href="#article-hubs" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
            Browse by topic hub
          </a>
          <Link href="/mypentest/example-report" className="rounded-full border border-white/15 px-5 py-3 text-sm text-muted transition-colors hover:border-accent hover:text-foreground">
            See an example report
          </Link>
        </nav>
      </PageHeader>
      <Section labelledBy="product-topics">
        <h2 id="product-topics" className="text-2xl font-semibold">Explore by security task</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Windows endpoint security", "/endpointradar"],
            ["Phishing link assessment", "/phishing-detector"],
            ["Username and breach research", "/myrecon"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-xl border border-white/10 bg-surface p-5 font-medium hover:text-accent">
              {label} →
            </Link>
          ))}
        </div>
      </Section>
      <Section id="article-hubs" labelledBy="hubs-overview-title" className="scroll-mt-24 border-t border-white/[0.06]">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Topic hubs</p>
          <h2 id="hubs-overview-title" className="mt-3 text-3xl font-semibold tracking-tight">
            {sortedPosts.length} guides across {HUBS.length} security topics
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Publication dates refer to our articles, not necessarily the incident or disclosure dates. Filter by topic or search by keyword below.
          </p>
        </div>
        <BlogHub hubs={HUBS} articles={summaries} />
        <aside aria-labelledby="scan-next-title" className="mt-12 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <h3 id="scan-next-title" className="text-xl font-semibold">What does this mean for your website?</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Run a MyPentest scan on a site you own to review findings from supported security checks.
                For a specific CVE, also compare your deployed software and configuration with the vendor advisory.
                A scan with no findings does not establish that every vulnerability has been ruled out.
              </p>
            </div>
            <a href={newAssessmentUrl()} className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
              Run a scan on your site
            </a>
          </div>
        </aside>
      </Section>
      <CtaBand
        title="Choose the tool for your next security question."
        primary={{ label: "Explore all products", href: "/products" }}
        lead="Review Windows posture, inspect suspicious links, research your footprint or assess a verified web application. Start with the scope and evidence each tool supports."
      />
    </SiteShell>
  );
}
