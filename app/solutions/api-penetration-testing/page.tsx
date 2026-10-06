import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Code2, Cpu, Database, Braces } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "API Penetration Testing: REST, GraphQL & Microservices Security",
  description:
    "Specialized API penetration testing for REST, GraphQL, and microservice architectures: uncovering BOLA, mass assignment, broken authentication, and rate-limit flaws.",
  path: "/solutions/api-penetration-testing",
});

const faqs = [
  {
    question: "Can BugSnaps test APIs without an OpenAPI specification?",
    answer:
      "Yes. BugSnaps automatically crawls and enumerates API endpoints from web traffic, JavaScript assets, and directory structures, while also supporting provided OpenAPI/Swagger specifications and GraphQL introspection schemas.",
  },
  {
    question: "How does BugSnaps test GraphQL APIs?",
    answer:
      "We probe GraphQL schemas for public introspection exposure, circular query depth denial-of-service vulnerabilities, field-level authorization bypasses, and batch query amplification attacks.",
  },
  {
    question: "What is the primary vulnerability discovered during API penetration testing?",
    answer:
      "Broken Object Level Authorization (BOLA/IDOR) is the most frequent and critical finding, where callers access or modify records belonging to other users simply by changing object identifiers.",
  },
];

export default function ApiPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "API Penetration Testing", path: "/solutions/api-penetration-testing" },
        ]}
        eyebrow="API Security"
        title="API Penetration Testing: REST, GraphQL & Microservices Security"
        lead="Test the machine-to-machine attack surface where your core data lives. Uncover BOLA, mass assignment, token flaws, and GraphQL vulnerabilities before adversaries do."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Beyond the Browser: Testing the API Layer
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Over 80% of internet traffic now traverses web and mobile APIs. While web frontends enforce UI validation, backend APIs often trust client requests implicitly. Attackers bypass user interfaces entirely, interacting directly with underlying API endpoints to extract unmasked database records.
        </p>

        {/* Sector Capability Benchmark */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">API Benchmark</span>
              <h3 className="mt-1 text-lg font-semibold">API Vulnerability Detection Rate: BugSnaps vs Traditional DAST</h3>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">95% vs 48%</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            BugSnaps combines REST, GraphQL, and paired-account BOLA testing to uncover authorization flaws traditional web scanners cannot see.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: "95%" }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Braces className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">BOLA &amp; IDOR Testing</h3>
            <p className="mt-2 text-sm text-muted">
              Verify object ownership permissions across paired test accounts for read, update, export, and delete actions.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Code2 className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">GraphQL Resolver Depth</h3>
            <p className="mt-2 text-sm text-muted">
              Test schema introspection, nested circular query denial of service, and field-level permission enforcement.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Database className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Mass Assignment &amp; Tampering</h3>
            <p className="mt-2 text-sm text-muted">
              Probe JSON payloads for unauthorized attribute binding, privilege escalation, and parameter pollution.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          How BugSnaps Leads in API Penetration Testing
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Standard scanners struggle with API state machines and modern JSON structures. BugSnaps MyPentest natively parses API contracts and executes differential authorization tests.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare BugSnaps benchmarks against other tools <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 space-y-6 max-w-3xl">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-white/[0.06] bg-surface p-5">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
