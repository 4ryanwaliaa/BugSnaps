import Link from "next/link";
import { ArrowRight, Check, ClipboardList, FileText, RotateCcw, ShieldCheck, Wrench } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ENGINE_FACTS, newAssessmentUrl } from "@/lib/mypentest";
import { ROADMAP } from "@/lib/mypentest/content";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Website Security Improvements: Find, Fix and Retest",
  description:
    "Turn web application pentest findings into practical security improvements. Prioritize vulnerability fixes, review evidence and retest with MyPentest by BugSnaps.",
  path: "/improvements",
});

const workflow = [
  {
    number: "01",
    icon: FileText,
    title: "Understand the evidence",
    body: "Review the affected endpoint, severity, confidence and reproduction details. Check which roles and routes the assessment reached before deciding what a finding means.",
    output: "A finding your team can investigate",
  },
  {
    number: "02",
    icon: Wrench,
    title: "Fix the underlying cause",
    body: "Use the remediation guidance to create a task with an owner and an acceptance test. Apply the fix at the authorization, input handling or configuration boundary that caused the issue.",
    output: "A change with a clear acceptance test",
  },
  {
    number: "03",
    icon: RotateCcw,
    title: "Retest the same behavior",
    body: "Run another assessment after the fix is deployed, then compare the original evidence with the new result. Confirm the route and test accounts were still reachable before closing the task.",
    output: "A reviewed record of the fix and retest",
  },
];

const priorities = [
  {
    title: "Access to customer data",
    area: "Broken access control and IDOR / BOLA",
    body: "Start with findings that may expose another user's records or allow a role to cross a permission boundary. Recheck authorization on the server for every protected object and action.",
    check: "The owner can access the record; a different test account cannot.",
    href: "/api-security-testing",
    link: "Explore API security testing",
  },
  {
    title: "Exposed secrets and credentials",
    area: "Leaked keys and configuration exposure",
    body: "Confirm whether a key is intended to be public and what access it grants. Revoke affected secrets, remove the exposure and review usage. Deleting a published secret alone does not invalidate it.",
    check: "The old secret no longer works and a fresh deployment does not expose the replacement.",
    href: "/web-application-pentesting",
    link: "Explore web application pentesting",
  },
  {
    title: "Untrusted input and sessions",
    area: "Injection, XSS and session weaknesses",
    body: "Address the affected input path or session boundary with the appropriate server-side control. Use parameterized queries, context-aware output handling and explicit session lifecycle rules where relevant.",
    check: "The original behavior is blocked and the legitimate user flow still works.",
    href: "/penetration-testing",
    link: "Understand penetration testing scope",
  },
  {
    title: "Configuration and exposed surface",
    area: "Headers, debug endpoints and known vulnerabilities",
    body: "Validate the finding in its deployment context. Remove unnecessary exposure and apply the relevant update or configuration change. Prioritize reachable risks and business impact alongside severity.",
    check: "The running application reflects the change, including its CDN or reverse proxy.",
    href: "/guides",
    link: "Read security testing guides",
  },
];

const checklist = [
  "Record the original finding, affected endpoint and application version.",
  "Choose an owner and a deadline based on impact, reachability and confidence.",
  "Write an acceptance test for the unsafe behavior and a control for legitimate behavior.",
  "Deploy the fix to the environment you intend to verify.",
  "Repeat the original scope and test roles; confirm authentication still succeeds.",
  "Review new evidence and failures, then record fixed, still present or inconclusive.",
];

const faqs = [
  {
    question: "How does MyPentest help improve website security?",
    answer:
      "MyPentest assesses a verified web application and reports findings with severity, confidence, evidence and remediation guidance. Your team implements the changes and can run another assessment to review the result. Use manual review for complex business logic and issues outside the automated assessment's scope.",
  },
  {
    question: "Does a missing finding after a retest mean it is fixed?",
    answer:
      "Only if the relevant route, role and check were exercised under comparable conditions. A failed login, unreachable endpoint, changed scope or interrupted assessment can hide an issue. Treat that result as inconclusive until the original behavior and a legitimate control have been checked.",
  },
  {
    question: "Are scheduled retests and automatic assessment comparisons available?",
    answer:
      "Scheduled retests and automatic diffing between assessments are on the MyPentest roadmap. Today, start another assessment yourself and compare the findings and evidence from your saved reports. Plan limits and available scan credits apply.",
  },
  {
    question: "Will AI penetration testing fix my application automatically?",
    answer:
      "MyPentest provides assessment findings and remediation guidance. It does not automatically patch your application or certify that it is secure. Review each recommendation in the context of your code, test the change and verify the result before marking it resolved.",
  },
  {
    question: "What should I try first?",
    answer:
      "Review the example report, pick a staging application you own or have written permission to test, and verify its domain. Run a baseline assessment with suitable test accounts, then choose one finding to investigate, fix and retest. Check the current plan limits before starting.",
  },
];

export default function ImprovementsPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[{ name: "Resources", path: "/resources" }, { name: "Security improvements", path: "/improvements" }]}
        eyebrow="Find. Fix. Fortify."
        title="Turn pentest findings into website security improvements."
        lead="A vulnerability report is the start of the work. MyPentest gives your team evidence and remediation guidance so you can choose the next fix, verify it and keep a useful record of what changed."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={newAssessmentUrl()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent">
            Start a free assessment <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link href="/mypentest/example-report" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-colors hover:border-white/20">
            See the example report <FileText className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="workflow-title">
        <SectionTitle
          id="workflow-title"
          eyebrow="A practical remediation workflow"
          title="Find the issue. Fix the cause. Check the result."
          lead="Use the same evidence throughout the process. This workflow is a guide for your team, rather than a promise that the scanner will implement or approve your patch."
        />
        <figure className="mt-10">
          <ol className="grid gap-4 md:grid-cols-3">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs tracking-wide text-accent">{step.number}</span>
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  <p className="mt-6 border-t border-white/[0.07] pt-4 text-sm font-medium">{step.output}</p>
                </li>
              );
            })}
          </ol>
          <figcaption className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            The security improvement cycle: assessment evidence connects a vulnerability to its fix and to a repeatable retest. Keep the original scope and environment details with each result.
          </figcaption>
        </figure>
      </Section>

      <Section labelledBy="priorities-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="priorities-title"
          eyebrow="Web application vulnerability remediation"
          title="Choose fixes that reduce the risk you actually have."
          lead="Use these examples to write actionable development tasks. Their order is a starting point; a finding's business impact, exposure and supporting evidence should guide your own queue."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {priorities.map((item) => (
            <article key={item.title} className="flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
              <p className="font-mono text-[11px] uppercase tracking-wide text-accent">{item.area}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              <div className="mt-5 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-foreground">Example acceptance check</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.check}</p>
              </div>
              <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                {item.link} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="checklist-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionTitle
              id="checklist-title"
              eyebrow="Your next pull request"
              title="A checklist for a fix you can verify."
              lead="Copy these steps into your issue tracker. A ticket should say how you will verify the change before it says the issue is closed."
            />
            <p className="mt-6 text-sm leading-relaxed text-muted">
              If the original test cannot run, record why. An inconclusive retest is useful evidence about a coverage gap; it is not confirmation that the vulnerability disappeared.
            </p>
            <Link href="/benchmarks" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              Review our evaluation criteria <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="space-y-3">
            {checklist.map((item, index) => (
              <li key={item} className="flex gap-4 rounded-xl border border-white/[0.07] bg-surface p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-accent">{index + 1}</span>
                <p className="pt-0.5 text-sm leading-relaxed text-muted">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section labelledBy="available-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="available-title"
          eyebrow="Product status"
          title="Know what you can use today."
          lead="The improvement workflow starts with the assessment and reports already in MyPentest. Planned conveniences are listed separately so you can make a decision using the current product."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="text-lg font-semibold">Available in MyPentest</h3>
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
              {[
                "Account-bound DNS verification and scoped assessment configuration.",
                `${ENGINE_FACTS.checks} checks, with passive and deeper testing modes and optional test accounts.`,
                "Findings with severity, confidence, evidence and remediation guidance.",
                "Saved assessment history and reports, subject to your plan's access limits.",
                "A new assessment you start yourself after deploying a fix.",
              ].map((item) => (
                <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
            <Link href="/mypentest" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              Explore the current product <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-surface p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-muted" aria-hidden="true" />
              <h3 className="text-lg font-semibold">On the roadmap</h3>
            </div>
            <ul className="mt-5 divide-y divide-white/[0.06]">
              {ROADMAP.map((item) => (
                <li key={item} className="flex items-start justify-between gap-3 py-3 text-sm leading-relaxed text-muted first:pt-0">
                  <span>{item}</span>
                  <span className="mt-0.5 shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-2">Planned</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted">These features are not currently available. No release date is promised here.</p>
          </div>
        </div>
      </Section>

      <Section labelledBy="try-title" className="border-t border-white/[0.05]">
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-9">
          <SectionTitle
            id="try-title"
            eyebrow="A useful first trial"
            title="Start with one application and one verifiable improvement."
            lead="Review the example report, verify an authorized staging domain, and configure realistic test accounts. Use the first assessment to decide whether the evidence and fix guidance fit how your team works."
          />
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
            A good trial leaves you with a clear task and a way to check it. Review the current free plan and severity visibility before you run; if you need deeper business-logic testing or a scoped retest engagement, talk with BugSnaps.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4 text-sm font-medium text-accent">
            <Link href="/pricing" className="hover:underline">Check current plans</Link>
            <Link href="/us-vs-competitors" className="hover:underline">Compare workflow fit</Link>
            <Link href="/contact" className="hover:underline">Discuss manual testing</Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Security improvement and retesting questions." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((item) => (
            <details key={item.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Give your next security fix a clear starting point."
        lead="Assess an application you are authorized to test, review the findings and build a practical remediation plan."
        secondary={{ label: "Review an example report", href: "/mypentest/example-report" }}
      />
    </SiteShell>
  );
}
