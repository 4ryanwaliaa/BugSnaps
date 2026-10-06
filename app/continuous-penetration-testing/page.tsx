import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Clock, GitCommit, RefreshCw, Shield, Terminal } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "Continuous Penetration Testing (PTaaS): Automated Security for CI/CD",
  description:
    "Continuous penetration testing as a service (PTaaS). Automate recurring DAST scans on code deployments, track perimeter drift, and verify remediation in real time.",
  path: "/continuous-penetration-testing",
});

const faqs = [
  {
    question: "What is Continuous Penetration Testing as a Service (PTaaS)?",
    answer:
      "Continuous Penetration Testing (PTaaS) replaces traditional point-in-time annual audits with recurring automated DAST assessments and on-demand human testing integrated directly into your software development lifecycle and CI/CD pipelines.",
  },
  {
    question: "How does BugSnaps integrate into our CI/CD workflow?",
    answer:
      "BugSnaps connects via webhooks, GitHub Actions, or GitLab CI. When a production or staging release is deployed, an automated assessment triggers against the target environment, exporting findings directly as SARIF or JSON to block high-risk regressions before they reach customers.",
  },
  {
    question: "How does fix retesting work in continuous pentesting?",
    answer:
      "When your engineering team patches a vulnerability and deploys the fix, you can trigger an instant single-target retest. BugSnaps re-executes the exact exploit payload to verify that the vulnerability is closed and updates your compliance attestation report automatically.",
  },
  {
    question: "Can continuous testing run against staging environments?",
    answer:
      "Yes. BugSnaps safe-active payloads are specifically designed for testing pre-production, staging, and preview environments without corrupting test databases or interfering with active engineering workflows.",
  },
];

const ptaasFeatures = [
  {
    icon: GitCommit,
    title: "Deployment-Triggered Testing",
    body: "Run automated security checks automatically on every production release, feature deployment, or perimeter configuration update.",
  },
  {
    icon: RefreshCw,
    title: "Instant Fix Retesting",
    body: "Validate vulnerability patches with one click. Retests run the exact proof-of-exploit check to ensure security fixes actually hold.",
  },
  {
    icon: Clock,
    title: "Attack Surface Drift Tracking",
    body: "Continuously detect new subdomains, modified API routes, and exposed staging services before external adversaries discover them.",
  },
  {
    icon: Shield,
    title: "Compliance Attestation Letters",
    body: "Maintain evergreen audit readiness for SOC 2, ISO 27001, and vendor risk questionnaires with up-to-date penetration testing reports.",
  },
];

const lifecycleSteps = [
  {
    number: "01",
    title: "Pipeline Integration",
    body: "Connect your deployment pipeline using webhooks or our CLI integration. Define in-scope domains and test credentials.",
  },
  {
    number: "02",
    title: "Autonomous DAST Execution",
    body: "On deployment, our browser engine maps new routes and runs 56 proof-of-exploit vulnerability checks against the target.",
  },
  {
    number: "03",
    title: "Developer Triage & SARIF",
    body: "Actionable reproduction curl commands and code fixes are surfaced directly in developer tools and PR status checks.",
  },
  {
    number: "04",
    title: "Verified Resolution",
    body: "Engineering deploys the patch, BugSnaps verifies remediation, and updated attestation documentation is instantly generated.",
  },
];

export default function ContinuousPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd
        data={serviceJsonLd({
          name: "Continuous Penetration Testing (PTaaS)",
          description:
            "Continuous penetration testing as a service (PTaaS) combining automated deployment-triggered DAST scans with expert remediation verification.",
          path: "/continuous-penetration-testing",
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Services", path: "/services" },
          { name: "Continuous Pentesting", path: "/continuous-penetration-testing" },
        ]}
        eyebrow="Continuous Security & PTaaS"
        title="Continuous Penetration Testing (PTaaS): Automated Security for CI/CD"
        lead="Shipping code daily while testing security once a year leaves your application exposed for 364 days. BugSnaps delivers continuous automated testing that moves at the speed of modern engineering."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Start Continuous Pentesting Free
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
            Subscription Plans
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="features-title">
        <SectionTitle
          id="features-title"
          eyebrow="PTaaS Advantages"
          title="Security that keeps pace with your release cycle."
          lead="Modern development teams cannot wait three weeks for a manual report. Continuous penetration testing provides real-time vulnerability feedback on every deploy."
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
          title="From code commit to verified remediation."
          lead="How our automated continuous penetration testing platform operates alongside your development workflow."
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
              title="Annual snapshot vs Continuous penetration testing."
              lead="Why forward-thinking engineering organizations are replacing legacy annual penetration tests with continuous testing."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                An annual pentest is outdated the moment your team merges the next pull request. By testing continuously, you catch security flaws within minutes of deployment rather than months later during an audit or breach post-mortem.
              </p>
              <p>
                BugSnaps combines the speed of automated scanning with the precision of deterministic exploit verification, delivering verified findings that developers can fix immediately without wading through hundreds of false alarms.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/solutions/saas-penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Explore SaaS penetration testing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Compare subscription tiers <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">The PTaaS Operational Advantage</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Zero Window of Exposure:</strong> Identify critical authorization or injection bugs within hours of release.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Developer Context Retention:</strong> Engineers fix issues while code is still fresh in their minds.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Audit Ready Year-Round:</strong> Always possess a current penetration testing report for enterprise procurement.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Cost Predictability:</strong> Flat-rate continuous testing avoids expensive last-minute emergency pentests.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about continuous penetration testing." />
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
        title="Upgrade to continuous penetration testing."
        lead="Integrate automated offensive security into your deployment pipelines and secure your web apps continuously."
        secondary={{ label: "View subscription pricing", href: "/pricing" }}
      />
    </SiteShell>
  );
}
