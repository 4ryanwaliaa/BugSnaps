import type { Metadata } from "next";
import Link from "next/link";
import { Clock, DollarSign, ArrowRight, Rocket } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Penetration Testing for Startups: Automated Checks and Expert Scope",
  description:
    "Start with a free automated web security assessment, review evidence and fixes, and scope expert-led penetration testing for your startup when deeper review is needed.",
  path: "/solutions/startup-penetration-testing",
});

const faqs = [
  {
    question: "When should an early-stage startup get a penetration test?",
    answer:
      "Consider testing before a launch, after significant authentication or payment changes, and when a customer requests a security review. Choose the scope and testing method around the application and the evidence the reviewer requires.",
  },
  {
    question: "How long does a BugSnaps startup assessment take?",
    answer:
      "Automated scan duration depends on DNS verification, scope, reachable routes, supplied accounts and scan limits. You can watch progress in the app. Expert-led schedules and report delivery are agreed during scoping; this page does not promise a fixed turnaround.",
  },
  {
    question: "Do enterprise customers accept BugSnaps reports during procurement reviews?",
    answer:
      "Acceptance depends on the customer and the evidence they request. MyPentest reports technical findings within automated coverage. If procurement requires independent manual testing, a specific report or a signed retest document, discuss those as separately scoped deliverables before booking.",
  },
];

export default function StartupPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "Startup Penetration Testing", path: "/solutions/startup-penetration-testing" },
        ]}
        eyebrow="Startup Security"
        title="Penetration Testing for Startups: Automated Checks and Expert Scope"
        lead="Review your application with a free automated assessment, then choose paid scan packs or discuss expert-led testing as your needs grow. Confirm customer report requirements before selecting a testing scope."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          A Practical Starting Point for Startup Security
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Your first assessment can help uncover exposed secrets, access-control weaknesses, injection indicators and configuration issues. MyPentest runs defined checks on a verified domain and reports evidence and confidence. Use those observations to plan remediation and decide where a deeper expert review is needed.
        </p>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <h3 className="text-lg font-semibold">Scope before promises</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">The free trial, Plus scan packs and expert engagements serve different needs. Current plan access is listed on the pricing page; no measured cost-saving or time-to-scan percentage is published.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Self-Service Assessment Setup</h3>
            <p className="mt-2 text-sm text-muted">
              Create an account, verify DNS ownership and configure your authorized scope. Supply dedicated test accounts for signed-in checks.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Predictable Flat Pricing</h3>
            <p className="mt-2 text-sm text-muted">
              The Plus plan provides scan packs with no expiry. Check current pricing for scan allowances, finding visibility and downloadable report access.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Rocket className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Prepare for Customer Reviews</h3>
            <p className="mt-2 text-sm text-muted">
              Ask the customer what testing and report evidence they require. Expert engagements and signed deliverables are agreed separately.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Choose Automated or Expert-Led Testing
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Automated checks offer repeatable observations within a defined application surface. Expert-led testing can examine business logic and custom roles that automation cannot fully assess. Compare scope, evidence, report access and agreed timelines; no universal cost or speed advantage is claimed.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare tools by scope and evidence <ArrowRight className="h-3.5 w-3.5" />
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

      <CtaBand title="Start with evidence from your own application." lead="Run a free automated assessment or discuss the deeper review your customer requires." secondary={{ label: "Discuss expert-led startup testing", href: "/contact?topic=enterprise" }} />
    </SiteShell>
  );
}
