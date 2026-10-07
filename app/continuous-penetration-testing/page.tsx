import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock, GitCommit, RefreshCw, Shield } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";
import { ROADMAP } from "@/lib/mypentest/content";

export const metadata: Metadata = pageMetadata({
  title: "Continuous Penetration Testing: A Practical Release Workflow",
  description:
    "Build a recurring penetration testing workflow with manually initiated MyPentest assessments, evidence review, remediation and scoped expert testing. Current limits explained.",
  path: "/continuous-penetration-testing",
});

const faqs = [
  {
    question: "What is continuous penetration testing?",
    answer:
      "Continuous penetration testing is a recurring security testing practice tied to releases, application changes and remediation. With MyPentest today, you start each automated assessment yourself and review its findings. Expert testing is scoped separately for business logic and other needs outside automated coverage.",
  },
  {
    question: "Does MyPentest automatically run when I deploy?",
    answer:
      "The current MyPentest product does not promise a deployment webhook, CI runner or automatic release gate. Add a manually initiated assessment to your release checklist. Scheduled retests and automatic assessment diffing are on the roadmap, with no release date promised here.",
  },
  {
    question: "How does fix retesting work in continuous pentesting?",
    answer:
      "Deploy the change, start another assessment with comparable scope and test accounts, and review the new evidence against the original finding. Confirm the affected route was exercised before marking the issue fixed. A focused expert retest can be discussed as a separately scoped engagement; MyPentest does not automatically issue a compliance attestation.",
  },
  {
    question: "Can continuous testing run against staging environments?",
    answer:
      "A reachable staging web application can be assessed when you can verify its domain and are authorized to test it. Configure the permitted scope and use dedicated test accounts. MyPentest offers passive and deeper non-destructive testing modes; reviewing the setup on staging first remains good practice.",
  },
];

const ptaasFeatures = [
  {
    icon: GitCommit,
    title: "Release Checklist Assessments",
    body: "Start an assessment after a meaningful release or configuration change. Your team chooses when to run and reviews the results before acting.",
  },
  {
    icon: RefreshCw,
    title: "Repeat After a Fix",
    body: "Run another assessment after deploying a patch. Compare scope, access and evidence before deciding whether the original issue is resolved.",
  },
  {
    icon: Clock,
    title: "Review New Attack Surface",
    body: "Each assessment performs discovery within its configured scope. Review new pages and API routes alongside your release changes; automatic drift comparison is not currently available.",
  },
  {
    icon: Shield,
    title: "Evidence for Review",
    body: "Retain reports with test scope and timing to support remediation and security discussions. Your auditor or customer decides what evidence an engagement must provide.",
  },
];

const lifecycleSteps = [
  {
    number: "01",
    title: "Define the Release Check",
    body: "Choose the authorized environment, verify its domain and configure scope and test accounts. Record the application version you are testing.",
  },
  {
    number: "02",
    title: "Start an Assessment",
    body: "Initiate the assessment in MyPentest. Discovery and testing run within the configured scope, with progress visible in the app.",
  },
  {
    number: "03",
    title: "Review Findings and Fixes",
    body: "Use severity, confidence, evidence and remediation guidance to create development tasks. Investigate ambiguous observations before treating them as confirmed issues.",
  },
  {
    number: "04",
    title: "Review the Retest",
    body: "Deploy a fix and repeat the relevant assessment. Record fixed, still present or inconclusive after reviewing access, coverage and new evidence.",
  },
];

export default function ContinuousPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd
        data={serviceJsonLd({
          name: "Recurring Penetration Testing Workflow",
          description:
            "A recurring security testing workflow with manually initiated MyPentest assessments and separately scoped expert penetration testing.",
          path: "/continuous-penetration-testing",
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Services", path: "/services" },
          { name: "Continuous Pentesting", path: "/continuous-penetration-testing" },
        ]}
        eyebrow="A recurring security practice"
        title="Continuous penetration testing starts with a repeatable release workflow."
        lead="Test after meaningful changes, review the evidence and verify the fixes. Use MyPentest for assessments your team starts and BugSnaps expert testing for separately scoped work that needs human review."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Start a Free Assessment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/penetration-testing"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Manual Penetration Testing
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Current Scan Plans
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="features-title">
        <SectionTitle
          id="features-title"
          eyebrow="Available workflow"
          title="Security that keeps pace with your release cycle."
          lead="Make recurring assessments part of your engineering checklist. MyPentest automates discovery and testing after you start a run; your team schedules the work and decides what the findings require."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ptaasFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="lifecycle-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="lifecycle-title"
          eyebrow="Continuous Lifecycle"
          title="From a release change to a reviewed retest."
          lead="Use comparable scope and access for every run. Keeping that context makes the results more useful when a new route appears or a patch changes existing behavior."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lifecycleSteps.map((step) => (
            <li key={step.number} className="spot rounded-2xl border border-white/[0.07] bg-surface p-6">
              <span className="font-mono text-xs font-semibold text-accent">{step.number}</span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="comparison-section-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="comparison-section-title"
              eyebrow="Modern Approach"
              title="Combine recurring assessments with expert testing."
              lead="An automated assessment and an expert-led engagement answer different questions. Choose their cadence and scope around your application and obligations."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                A report describes the application and scope tested at a particular time. Later releases can change those conditions. Repeating relevant assessments after significant changes helps your team check the current application rather than rely only on an older report.
              </p>
              <p>
                Automated checks provide repeatable coverage of the routes they can reach. Manual testing is still useful for multi-step business logic, custom roles and risks outside that coverage. Neither a recurring cadence nor an automated report establishes that all vulnerabilities have been found.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/solutions/saas-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Explore SaaS penetration testing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Compare current scan plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">What to keep with every assessment</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Scope and version:</strong> Save the target, roles, exclusions and application version.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Development context:</strong> Link the finding to its owner, fix and acceptance test.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Evidence and limits:</strong> Record the finding, test coverage and any access failures.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Run budget:</strong> Check current plan limits and available credits before a new assessment.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="roadmap-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle id="roadmap-title" eyebrow="Product status" title="Scheduled retests are planned." lead="Assessments are manually initiated today. These MyPentest features are on the roadmap and are not currently available." />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {ROADMAP.map((item) => (
            <li key={item} className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.07] bg-surface p-5 text-sm text-muted">
              <span>{item}</span><span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-2">Planned</span>
            </li>
          ))}
        </ul>
        <Link href="/improvements" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">Use the remediation and retest checklist <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about continuous penetration testing." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <span>{faq.question}</span>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Make your next security assessment repeatable."
        lead="Start with an authorized staging application, review the evidence and plan the next check around your release changes."
        secondary={{ label: "Discuss a recurring engagement", href: "/contact" }}
      />
    </SiteShell>
  );
}
