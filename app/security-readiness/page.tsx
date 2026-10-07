import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "Security Readiness: Evidence, Scope and Remediation",
  description:
    "Prepare for website security reviews with defined assessment scope, evidence, severity, confidence and remediation. Learn the limits of automated pentesting.",
  path: "/security-readiness",
});

const faqs = [
  {
    question: "What authorization do I need before testing?",
    answer:
      "You must own the target or have written permission to assess it. MyPentest requires an account-bound DNS TXT ownership check and a defined target scope. DNS control does not replace permission from the application owner or any other required parties.",
  },
  {
    question: "Can BugSnaps testing accidentally crash our live production database or corrupt user data?",
    answer:
      "MyPentest uses non-destructive checks and paced requests, with no denial-of-service, password guessing or data changes. No testing tool can guarantee zero impact on every application. Use staging first, choose passive testing when appropriate and provide dedicated test accounts.",
  },
  {
    question: "What levels of vulnerabilities does BugSnaps detect?",
    answer:
      "Reports include critical, high, medium, low and informational classifications. Severity depends on the observed issue and its impact; confidence describes how strongly the evidence supports it. The examples below explain risk, not a guarantee of every vulnerability the scanner can detect.",
  },
  {
    question: "How does BugSnaps help us prove security readiness to enterprise customers and investors?",
    answer:
      "Use the assessment scope, evidence, findings and remediation record to support a review. MyPentest is not a security certification. If a customer requires independent manual testing, a signed letter or a specific retest deliverable, discuss those requirements in a separately scoped BugSnaps engagement before booking.",
  },
];

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Find actionable security issues",
    description: "Run defined checks against your verified application and prioritize observed issues. Automated findings contribute to security work; they do not prevent every breach.",
  },
  {
    icon: Lock,
    title: "Define the authorized scope",
    description: "Verify the domain and document permission, targets and test accounts. Ownership verification is one safeguard within a properly authorized assessment.",
  },
  {
    icon: Zap,
    title: "Choose non-destructive testing",
    description: "Choose passive or safe-active checks with paced requests. Start on staging and decide the scope and mode based on your application and operating constraints.",
  },
  {
    icon: Sparkles,
    title: "Prepare evidence for reviewers",
    description: "Bring findings, severity, confidence and remediation to a review. Agree on any required manual testing and deliverables with your reviewer and the BugSnaps team.",
  },
];

const severityLevels = [
  {
    level: "Critical impact",
    badge: "Catastrophic Business Impact",
    color: "text-red-400 border-red-500/20 bg-red-500/[0.05]",
    description: "An issue with severe potential impact may warrant urgent action. Its assigned severity needs to reflect the affected system, access requirements and observed evidence.",
    examples: [
      "Command or template injection observations with severe potential impact",
      "Cross-account read access to sensitive test records (IDOR / BOLA)",
      "Injection indicators on sensitive unauthenticated endpoints",
      "A publicly exposed server-side secret or environment file",
    ],
  },
  {
    level: "High impact",
    badge: "Privilege Escalation & Account Takeover",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/[0.05]",
    description: "A serious weakness can expose sensitive data or undermine authentication. The assessment should explain the affected boundary and what was actually observed.",
    examples: [
      "Cross-site scripting observations affecting a sensitive context",
      "Session fixation or ineffective logout handling",
      "Weak JWT handling or exposure of session material",
      "A sensitive debug endpoint accessible without authentication",
    ],
  },
  {
    level: "Medium impact",
    badge: "Workflow Abuse & Data Exposure",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/[0.05]",
    description: "Context and preconditions matter. A likely observation may need focused validation before your team decides its severity and remediation.",
    examples: [
      "Cross-Site Request Forgery (CSRF) on state-changing user actions",
      "Differential injection indicators needing additional validation",
      "Overly permissive CORS configurations reflecting origins with credentials",
      "Internal server IP address and backend infrastructure stack disclosure",
    ],
  },
  {
    level: "Low and informational observations",
    badge: "Defense-in-Depth & Attack Surface",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.05]",
    description: "Configuration findings and informational observations help improve defenses. Their significance depends on the application, existing controls and exposure.",
    examples: [
      "Missing Content-Security-Policy (CSP) and HTTP Strict-Transport-Security (HSTS)",
      "Unnecessary software version or server banner exposure",
      "Verbose application error pages exposing framework stack traces",
      "Legacy TLS cipher support and missing cookie security flags (HttpOnly/Secure)",
    ],
  },
];

export default function SecurityReadinessPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Resources", path: "/resources" },
          { name: "Security Readiness & Trust", path: "/security-readiness" },
        ]}
        eyebrow="Security readiness and trust"
        title="Security Readiness: Evidence, Scope and Remediation"
        lead="Prepare for your next security review with a defined assessment, supporting evidence and a remediation plan. MyPentest helps surface issues in your authorized application; expert testing and reviewer requirements are scoped separately."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Start Free Security Assessment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/benchmarks"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            View Benchmark Methodology
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Book Scoping Call
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="trust-pillars-title">
        <SectionTitle
          id="trust-pillars-title"
          eyebrow="Practical safeguards"
          title="Build a security review around scope and evidence."
          lead="Use observable findings to plan fixes and follow-up testing. Neither automated results nor a report can guarantee security or an audit outcome."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="levels-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="levels-title"
          eyebrow="Understanding findings"
          title="Read severity alongside confidence."
          lead="These are illustrative impact categories. Actual severity is assigned per finding; informational observations may also appear. The engine's defined checks and discovered surface determine coverage."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {severityLevels.map((s) => (
            <div key={s.level} className={`rounded-2xl border p-7 ${s.color}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{s.level}</h3>
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs font-medium text-foreground/80">
                  {s.badge}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
              <ul className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4">
                {s.examples.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="world-ready-attestation-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="world-ready-attestation-title"
              eyebrow="Enterprise Readiness"
              title="Prepare for customer and audit security reviews."
              lead="Ask what evidence the reviewer requires, then agree on the assessment scope, testing method and deliverables."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                MyPentest findings include severity, confidence, evidence and remediation. Paid plans offer downloadable reports and saved history. These records can support follow-up work, but an automated assessment does not certify compliance or guarantee acceptance.
              </p>
              <p>
                Expert-led testing can focus on business logic, custom roles and tenant boundaries beyond automated coverage. Confirm the applicable methodology, retesting, schedule and any signed deliverables in the engagement scope.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/solutions/soc2-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Discuss testing for a SOC 2 review <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/solutions/startup-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Startup penetration testing solutions <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">Assessment preparation checklist</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Domain verification:</strong> Publish the account-bound DNS TXT record and document permission to test.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Testing mode:</strong> Choose passive or safe-active checks and start on staging where possible.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Evidence and confidence:</strong> Review each observation and validate uncertain findings.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Remediation follow-up:</strong> Reassess affected routes; agree separately on any expert retest report.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about security readiness." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{faq.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Start with a scoped application assessment."
        lead="Review defined checks, evidence and remediation for a website you own or are authorized to test."
        secondary={{ label: "Explore all comparisons", href: "/compare" }}
      />
    </SiteShell>
  );
}
