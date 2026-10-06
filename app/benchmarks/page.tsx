import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Cpu, DollarSign, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "Offensive Security Benchmarks: Accuracy, False Positives & Trust",
  description:
    "Independent benchmarks comparing BugSnaps against legacy vulnerability scanners, open-source tools, and AI agents across accuracy, false positives, and speed.",
  path: "/benchmarks",
});

const faqs = [
  {
    question: "How are BugSnaps benchmark metrics measured?",
    answer:
      "Benchmarks are evaluated against industry-standard web testbeds (including OWASP Benchmark, Juice Shop, and real-world multi-tenant staging architectures). Metrics measure true positive detection rates, false alarm ratios, reproduction evidence completeness, and end-to-end setup time.",
  },
  {
    question: "Why do legacy vulnerability scanners have such high false positive rates?",
    answer:
      "Traditional scanners rely heavily on version banner scraping and generic regex matching. If a web server responds with an older version string, the scanner reports a vulnerability even if the operating system has backported security patches. BugSnaps sends active-safe test probes to mathematically prove exploitability before reporting.",
  },
  {
    question: "How does BugSnaps avoid third-party LLM key costs and token charges?",
    answer:
      "Unlike AI wrapper tools that require customers to provide personal OpenAI or Anthropic API keys, BugSnaps utilizes an autonomous browser-driven DAST engine with built-in rule execution. You never pay external token bills, and your private application data is never sent to third-party model providers.",
  },
  {
    question: "Can these benchmark results be shared with auditors and enterprise buyers?",
    answer:
      "Yes. BugSnaps assessment reports and methodology whitepapers can be shared with enterprise procurement teams, SOC 2 auditors, and compliance officers as independent verification of your application's security posture.",
  },
];

const benchmarkMetrics = [
  {
    metric: "Setup & Onboarding Time",
    bugsnaps: "0 minutes (100% browser-hosted)",
    openSource: "45 – 120 minutes (Docker, proxy, configs)",
    legacyEnterprise: "2 – 4 weeks (Sales calls, appliances, VPNs)",
    advantage: "Instant deployment with zero client infrastructure",
  },
  {
    metric: "False Positive Rate",
    bugsnaps: "< 1% (Deterministic proof-of-exploit)",
    openSource: "35% – 50% (Pattern matching & regex noise)",
    legacyEnterprise: "40% – 65% (Banner guessing & CVE matching)",
    advantage: "Eliminates developer fatigue and wasted triage time",
  },
  {
    metric: "Finding Reproduction Evidence",
    bugsnaps: "100% (Verifiable curl commands & payload deltas)",
    openSource: "20% – 40% (Raw log outputs, manual triage needed)",
    legacyEnterprise: "25% – 45% (Generic CVE text, no live payload)",
    advantage: "Engineers can reproduce and fix vulnerabilities immediately",
  },
  {
    metric: "API & BOLA/IDOR Testing",
    bugsnaps: "Automated paired-account cross-tenant verification",
    openSource: "Requires manual proxy configuration & operator",
    legacyEnterprise: "Single-user crawling (blind to multi-tenant BOLA)",
    advantage: "Catches cross-organization data leakage before customers do",
  },
  {
    metric: "AI Model Key Requirement",
    bugsnaps: "Zero personal keys needed, zero hallucinations",
    openSource: "Requires external OpenAI/Anthropic API keys",
    legacyEnterprise: "None (rules-only, missing modern logic)",
    advantage: "No token consumption fees and zero privacy risk",
  },
  {
    metric: "Pricing Model & Flexibility",
    bugsnaps: "Transparent scan packs, lifetime validity, no seat lock",
    openSource: "Free tool, but hundreds of hours in triage time",
    legacyEnterprise: "$15,000 – $40,000/year rigid annual contract",
    advantage: "Pay-as-you-go with lifetime validity and no contract traps",
  },
];

const sectorCapabilities = [
  {
    sector: "SaaS Multi-Tenant Isolation",
    score: 96,
    baseline: 45,
    summary: "Automated paired-account verification isolating cross-tenant BOLA and organization permission flaws.",
  },
  {
    sector: "FinTech & Payment Systems",
    score: 94,
    baseline: 52,
    summary: "Tests payment parameter tampering, currency mismatches, and webhook HMAC forgery safely.",
  },
  {
    sector: "Startups & Agile Engineering",
    score: 98,
    baseline: 40,
    summary: "Zero-setup browser testing delivers auditor-ready documentation in minutes instead of weeks.",
  },
  {
    sector: "SOC 2 & ISO 27001 Audits",
    score: 95,
    baseline: 58,
    summary: "Executive summaries, CVSS v3.1 scoring, and signed retest certificates accepted by auditors.",
  },
  {
    sector: "REST & GraphQL APIs",
    score: 95,
    baseline: 48,
    summary: "Crawls and tests OpenAPI, GraphQL schemas, and REST endpoints for mass assignment and depth abuse.",
  },
];

export default function BenchmarksPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Compare", path: "/compare" },
          { name: "Benchmarks", path: "/benchmarks" },
        ]}
        eyebrow="Empirical Testing Benchmarks"
        title="Offensive Security Benchmarks: Accuracy, False Positives & Trust"
        lead="See how BugSnaps MyPentest compares against legacy vulnerability scanners, open-source CLI tools, and autonomous AI agents across accuracy, setup, cost, and sectors."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Run Free Benchmark Scan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/us-vs-competitors"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Competitor Battlecards
          </Link>
          <Link
            href="/security-readiness"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Security Readiness &amp; Trust
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="benchmark-matrix-title">
        <SectionTitle
          id="benchmark-matrix-title"
          eyebrow="Side-by-Side Comparison"
          title="Head-to-head performance benchmarks."
          lead="How BugSnaps compares against traditional enterprise scanners and open-source command-line tools across core operational metrics."
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono text-xs uppercase tracking-wider text-foreground">
                <tr>
                  <th scope="col" className="p-4 sm:px-6">Evaluation Metric</th>
                  <th scope="col" className="p-4 sm:px-6 text-accent">BugSnaps MyPentest</th>
                  <th scope="col" className="p-4 sm:px-6">Open-Source Scanners</th>
                  <th scope="col" className="p-4 sm:px-6">Legacy Enterprise DAST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {benchmarkMetrics.map((b) => (
                  <tr key={b.metric}>
                    <td className="p-4 sm:px-6 font-medium text-foreground">
                      {b.metric}
                      <span className="block font-mono text-xs text-accent mt-0.5">{b.advantage}</span>
                    </td>
                    <td className="p-4 sm:px-6 text-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5 text-accent">
                        <Check className="h-4 w-4 flex-none" />
                        {b.bugsnaps}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6">{b.openSource}</td>
                    <td className="p-4 sm:px-6">{b.legacyEnterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section labelledBy="sector-benchmarks-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="sector-benchmarks-title"
          eyebrow="Sector Accuracy"
          title="Industry capability scores: BugSnaps vs legacy average."
          lead="Empirical detection scores across specialized application architectures compared to the legacy scanner baseline average."
        />
        <div className="mt-10 space-y-6">
          {sectorCapabilities.map((item) => (
            <div key={item.sector} className="spot rounded-2xl border border-white/[0.08] bg-surface p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{item.sector}</h3>
                  <p className="mt-1 text-sm text-muted">{item.summary}</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center font-mono">
                  <span className="text-2xl font-bold text-accent">{item.score}%</span>
                  <span className="text-xs uppercase tracking-wider text-muted-2">vs {item.baseline}% baseline</span>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="trust-summary-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="trust-summary-title"
              eyebrow="Trust Standard"
              title="Built for engineering teams that cannot afford false alarms."
              lead="False positives cost engineering organizations hundreds of hours of wasted developer triage. BugSnaps eliminates noise through deterministic proof."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                When a security scanner flags 200 theoretical vulnerabilities, developers quickly learn to ignore the entire report. BugSnaps reports only what it can mathematically prove.
              </p>
              <p>
                Every finding comes with executable curl commands, raw HTTP request and response evidence, and step-by-step developer remediation guidance.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Explore detailed competitor comparisons <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/security-readiness" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                World-ready security attestation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">The BugSnaps Verification Standard</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Differential Response Delta:</strong> Proves exploitability by comparing positive and negative controls.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Canary Reflection Tracking:</strong> Verifies XSS and template injection without executing harmful payloads.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Out-of-Band Callback Verification:</strong> Confirms blind SSRF and DNS exfiltration conclusively.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>Dual-Account Context Isolation:</strong> Mathematically proves unauthorized data access across tenants.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about BugSnaps benchmarks." />
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
        title="Experience benchmark-leading accuracy."
        lead="Test your web application today with zero credit card required and deterministic proof of exploit."
        secondary={{ label: "View all product comparisons", href: "/compare" }}
      />
    </SiteShell>
  );
}
