import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Database, Braces } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "API Penetration Testing: REST, GraphQL & Microservices Security",
  description:
    "Plan REST and GraphQL API penetration testing with BugSnaps. Compare MyPentest's discovered API checks with scoped expert authorization and business-logic testing.",
  path: "/solutions/api-penetration-testing",
});

const faqs = [
  {
    question: "Can BugSnaps test APIs without an OpenAPI specification?",
    answer:
      "MyPentest discovers supported API surfaces from reachable web pages, JavaScript references, exposed OpenAPI documents and GraphQL introspection. Discovery and account access limit coverage. Importing an OpenAPI definition into the automated product is on the roadmap; supplied API documentation can help scope a separate expert engagement.",
  },
  {
    question: "How does BugSnaps test GraphQL APIs?",
    answer:
      "MyPentest checks supported discovered GraphQL surfaces, including introspection exposure. For resolver authorization, query cost, batching and complex role models, discuss a separately scoped expert API engagement. Automated MyPentest assessments do not perform denial-of-service tests.",
  },
  {
    question: "Why test object-level authorization in an API?",
    answer:
      "Broken Object Level Authorization (BOLA/IDOR) occurs when a caller can access another user's object without the required permission. MyPentest supports read-access checks using suitable paired test accounts and reachable records. Write operations and deeper business-logic tests need a separately agreed scope and appropriate fixtures.",
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
        lead="Assess how your REST and GraphQL APIs enforce authentication and access boundaries. Start with supported automated checks, or scope expert testing for complex roles and business logic."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Beyond the Browser: Testing the API Layer
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          A frontend can hide a field or action while the API still exposes it. Assess the server-side authorization boundary directly: which account can read each object, call each function and receive each sensitive field? Record endpoints, roles and expected results before testing.
        </p>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">Evidence before rankings</span>
          <h3 className="mt-2 text-lg font-semibold">Evaluate API testing on the same roles and endpoints.</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Review discovered endpoints, successful logins and reproducible findings. A missed path or failed authentication can hide a vulnerability. No comparative API detection percentage is published here; head-to-head measurements remain pending.
          </p>
          <Link href="/benchmarks" className="mt-4 inline-block text-sm text-accent hover:underline">Review the reproducible benchmark protocol</Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Braces className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">BOLA &amp; IDOR Testing</h3>
            <p className="mt-2 text-sm text-muted">
              MyPentest checks supported read access across suitable paired test accounts. Reachable records and successful authentication determine which boundaries can be assessed.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Code2 className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">GraphQL Surface Review</h3>
            <p className="mt-2 text-sm text-muted">
              Review reachable introspection and schema exposure. Discuss resolver permissions, query cost and batching separately when scoping expert testing; automated assessments exclude denial-of-service tests.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Database className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Expert API and Logic Testing</h3>
            <p className="mt-2 text-sm text-muted">
              Agree the roles, test fixtures and permitted actions for mass assignment, function-level authorization, write operations and business-logic investigation.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Choose Automated or Expert API Testing
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Use MyPentest for a hosted assessment of a verified deployed application and its discovered API surfaces. Supplied API contracts and an authorization matrix help an expert engagement reach paths that automated discovery may miss. Confirm coverage and limitations rather than treating every scanner or AI agent as interchangeable.
          </p>
          <p>Document one legitimate control and one denied action for each relevant account pair. After fixing a finding, verify the original path still runs and the expected access boundary holds. A clean report does not prove that every endpoint or role was tested.</p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare security testing workflows <ArrowRight className="h-3.5 w-3.5" />
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

      <CtaBand title="Assess the API behind your application." lead="Start with a verified staging target and suitable test accounts. Review current plan limits, or discuss a separately scoped expert API engagement." secondary={{ label: "Scope expert API testing", href: "/contact" }} />
    </SiteShell>
  );
}
