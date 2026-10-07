import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Key, Zap } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "SaaS Penetration Testing: Multi-Tenant & API Security Testing",
  description:
    "SaaS penetration testing for multi-tenant applications: review tenant isolation, BOLA/IDOR, roles and sessions with scoped automated assessments and expert testing.",
  path: "/solutions/saas-penetration-testing",
});

const faqs = [
  {
    question: "What makes SaaS penetration testing unique compared to traditional testing?",
    answer:
      "SaaS testing needs to consider tenant isolation, object and role authorization, sessions and business workflows. An issue at a shared access boundary may affect multiple customer organizations. The assessment must use roles, records and scope that represent the application being tested.",
  },
  {
    question: "How does BugSnaps test multi-tenant boundaries?",
    answer:
      "MyPentest can use test accounts you supply to assess access control between users on reachable routes. Prepare representative accounts and existing test records in separate tenants; the scanner does not create records or perform arbitrary data-changing business actions. Complex role hierarchies and multi-step workflows should be discussed as separately scoped manual testing.",
  },
  {
    question: "Can BugSnaps test SaaS staging environments?",
    answer:
      "A reachable staging web application can be assessed when you verify the domain and are authorized to test it. Configure scope and dedicated test accounts, then begin with a controlled assessment. DNS verification confirms control of the domain; written permission and the agreed scope still matter.",
  },
  {
    question: "Does BugSnaps have measured SaaS accuracy scores against other scanners?",
    answer:
      "No completed head-to-head benchmark artifacts are published on this site. The benchmark page provides a proposed evaluation method and test cases, rather than measured detection percentages or an industry ranking.",
  },
  {
    question: "Does a SaaS assessment provide a compliance attestation?",
    answer:
      "An automated report can support remediation and security discussions. It does not certify compliance or guarantee acceptance by a customer or auditor. Discuss the required engagement scope, independence and documentation with the relevant assessor before commissioning testing.",
  },
];

export default function SaasPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "SaaS Penetration Testing", path: "/solutions/saas-penetration-testing" },
        ]}
        eyebrow="Industry Solutions"
        title="SaaS Penetration Testing: Multi-Tenant & API Security Testing"
        lead="Assess the boundaries between users, roles and customer organizations. Combine MyPentest's scoped automated checks with expert testing for SaaS workflows that require human judgment."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Why Multi-Tenant SaaS Requires Dedicated Security Testing
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          A multi-tenant application may share infrastructure while keeping each customer's records separate. Testing needs to check whether that separation holds across object access, roles and session boundaries. Give the assessment representative test accounts and existing records so it can reach the behavior you want reviewed.
        </p>

        {/* Evaluation status is explicit until reproducible runs are published. */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Evaluation status</span>
              <h3 className="mt-1 text-lg font-semibold">Compare tenant-isolation evidence on the same fixture.</h3>
            </div>
            <span className="mt-3 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted sm:mt-0">Measurements pending</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            No completed comparative accuracy scores are published here. Use the same tenants, roles, routes and expected results for each tool, then independently review the evidence and any missed cases.
          </p>
          <Link href="/benchmarks" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">Review the benchmark method <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Users className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">Tenant Boundary Testing</h3>
            <p className="mt-2 text-sm text-muted">
              Use supplied accounts and existing records to assess cross-user access on reachable routes. Agree separately on any manual testing of updates, exports and multi-step tenant workflows.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Key className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">Role and Workflow Review</h3>
            <p className="mt-2 text-sm text-muted">
              Identify the roles and actions that matter, such as billing, invitations and administration. Scope expert testing for data-changing or business-logic behavior beyond automated checks.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Zap className="h-5 w-5 text-blue-400" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">Session &amp; Token Lifecycles</h3>
            <p className="mt-2 text-sm text-muted">
              Review supported session and token checks, including logout behavior. Test membership removal, password resets and organization changes as explicitly scoped workflows.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Choose SaaS testing based on scope and evidence.
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            MyPentest maps a verified web application and can use supplied test accounts for supported access-control checks. Compare tools by the routes and roles they exercise, the evidence they return and the manual work required to investigate the results. Different scanners have different authenticated testing capabilities; performance needs a reproducible comparison.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare security testing workflows <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <p>After a fix, start another assessment and compare the relevant evidence. Scheduled retests and automatic assessment diffing are planned rather than currently available.</p>
          <Link href="/improvements" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">Use the remediation and retest checklist <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
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

      <CtaBand title="Assess the boundaries that matter to your SaaS." lead="Verify an authorized staging domain, configure representative test accounts and review the evidence before planning fixes." secondary={{ label: "Discuss manual SaaS testing", href: "/contact" }} />
    </SiteShell>
  );
}
