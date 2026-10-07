import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck, Award, RefreshCw } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "SOC 2 Penetration Testing: Scope and Reports for Security Reviews",
  description:
    "Plan a penetration testing engagement for your SOC 2 security review. Agree on scope, methodology, reporting and retesting with your reviewer and BugSnaps.",
  path: "/solutions/soc2-penetration-testing",
});

const faqs = [
  {
    question: "Do SOC 2 auditors accept BugSnaps penetration testing reports?",
    answer:
      "Acceptance depends on the reviewer and the agreed requirements. Share the proposed target scope, testing method and deliverables before booking. MyPentest is an automated assessment; an expert-led engagement and any signed deliverables must be separately scoped.",
  },
  {
    question: "What should we agree on before booking a SOC 2-related pentest?",
    answer:
      "Confirm the required targets, user roles, methodology, report contents, independence expectations and retest process with your reviewer. BugSnaps can then discuss an engagement around those requirements. This page does not prescribe audit controls or certify compliance.",
  },
  {
    question: "Does BugSnaps include retesting for SOC 2 compliance?",
    answer:
      "Retesting, its schedule and any written sign-off need to be agreed in the expert engagement scope. An automated reassessment can produce new observations; it does not certify that every vulnerability has been closed.",
  },
];

export default function Soc2PenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "SOC 2 Penetration Testing", path: "/solutions/soc2-penetration-testing" },
        ]}
        eyebrow="Planning for a security review"
        title="SOC 2 Penetration Testing: Scope and Reports for Security Reviews"
        lead="Prepare a testing scope around the evidence your reviewer needs. Discuss expert-led testing, report contents and remediation follow-up separately from MyPentest automated scans."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Agree on the Evidence Your Reviewer Needs
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Ask your reviewer which systems, roles, testing methods and deliverables they expect. A structured assessment can document observed issues and remediation, while an automated scan has a defined coverage boundary. Confirm whether a separately scoped expert assessment is needed before relying on either report for a review.
        </p>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <h3 className="text-lg font-semibold">Scope before promises</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">Reviewer acceptance depends on the agreed requirements. We do not publish an auditor acceptance percentage or treat an automated report as a compliance certificate.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <FileCheck className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Report Requirements</h3>
            <p className="mt-2 text-sm text-muted">
              Agree on the executive summary, target scope, methodology, technical findings and any signed document the reviewer requests.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Award className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Documented Methodology</h3>
            <p className="mt-2 text-sm text-muted">
              Record the testing method, accounts, exclusions and limits in the engagement scope so the reviewer can assess what the report covers.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Remediation Follow-up</h3>
            <p className="mt-2 text-sm text-muted">
              Define which findings and routes will be retested, what evidence will be captured and what any retest report will state.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Compare Testing Scope and Evidence
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Compare automated and expert-led workflows by their scope, evidence and agreed deliverables. No tool comparison can guarantee reviewer acceptance or an audit outcome.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare testing approaches and limitations <ArrowRight className="h-3.5 w-3.5" />
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

      <CtaBand title="Plan the assessment your reviewer needs." lead="Start with the required targets, testing method and report contents. Agree on expert testing and any retest deliverables before booking." secondary={{ label: "Discuss an expert-led scope", href: "/contact?topic=enterprise" }} />
    </SiteShell>
  );
}
