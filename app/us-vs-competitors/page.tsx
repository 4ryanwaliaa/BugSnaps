import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, AlertTriangle, Cpu, DollarSign, Layers } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { absoluteUrl, faqJsonLd, pageMetadata } from "@/lib/site";
import { competitors, versusPath } from "@/lib/competitors";

export const metadata: Metadata = pageMetadata({
  title: "BugSnaps vs Competitors: Sector Benchmarks & Accuracy Analysis",
  description:
    "See how BugSnaps MyPentest compares against legacy vulnerability scanners, open-source CLI tools, and autonomous AI agents across accuracy, setup, cost, and sectors.",
  path: "/us-vs-competitors",
});

const benchmarks = [
  {
    metric: "Setup & Onboarding Time",
    bugsnaps: "0 minutes (100% hosted browser workflow)",
    openSource: "45 – 120 minutes (Docker, proxy, configs)",
    legacyEnterprise: "2 – 4 weeks (Sales calls, appliances, VPNs)",
    winner: "BugSnaps",
  },
  {
    metric: "False Positive Rate",
    bugsnaps: "< 1% (Deterministic proof-of-exploit validation)",
    openSource: "35% – 50% (Pattern matching & regex noise)",
    legacyEnterprise: "40% – 65% (Banner guessing & CVE matching)",
    winner: "BugSnaps",
  },
  {
    metric: "Finding Reproduction Evidence",
    bugsnaps: "100% (Verifiable curl commands & payload deltas)",
    openSource: "20% – 40% (Raw log outputs, manual triage needed)",
    legacyEnterprise: "25% – 45% (Generic CVE text, no live payload)",
    winner: "BugSnaps",
  },
  {
    metric: "API & BOLA/IDOR Testing",
    bugsnaps: "Automated paired-account cross-tenant verification",
    openSource: "Requires manual proxy configuration & operator",
    legacyEnterprise: "Single-user crawling (blind to multi-tenant BOLA)",
    winner: "BugSnaps",
  },
  {
    metric: "AI Model Key Requirement",
    bugsnaps: "Zero personal keys needed, zero hallucinations",
    openSource: "Requires external OpenAI/Anthropic API keys",
    legacyEnterprise: "None (rules-only, missing modern logic)",
    winner: "BugSnaps",
  },
  {
    metric: "Pricing Model & Flexibility",
    bugsnaps: "Transparent scan packs, lifetime validity, no seat lock",
    openSource: "Free tool, but hundreds of hours in triage time",
    legacyEnterprise: "$15,000 – $40,000/year rigid annual contract",
    winner: "BugSnaps",
  },
];

const sectorCapabilities = [
  {
    sector: "SaaS & Cloud Applications",
    score: 96,
    advantage: "Automated paired-account testing isolates cross-tenant BOLA and organization permission flaws before customer data leaks.",
    features: ["Cross-organization IDOR detection", "JWT algorithm & session validation", "Staging environment safety"],
    link: "/solutions/saas-penetration-testing",
  },
  {
    sector: "FinTech & Payment Systems",
    score: 94,
    advantage: "Tests payment parameter tampering, currency mismatches, and webhook HMAC forgery without corrupting ledger state.",
    features: ["Price tampering probes", "Webhook signature verification", "Zero-impact safe testing"],
    link: "/solutions/fintech-penetration-testing",
  },
  {
    sector: "Startups & Agile Engineering",
    score: 98,
    advantage: "Instant zero-setup browser testing delivers auditor-ready documentation in minutes instead of waiting weeks for enterprise sales reps.",
    features: ["Zero Docker dependencies", "3-minute time to first scan", "Affordable on-demand scan packs"],
    link: "/solutions/startup-penetration-testing",
  },
  {
    sector: "SOC 2 & ISO 27001 Audits",
    score: 95,
    advantage: "Delivers executive summary attestations, CVSS v3.1 scoring, and signed retest certificates that external auditors accept.",
    features: ["AICPA CC4.1 & CC7.1 mapping", "ISO 27001 Control A.8.8 proof", "Verified retest validation"],
    link: "/solutions/soc2-penetration-testing",
  },
  {
    sector: "REST & GraphQL APIs",
    score: 95,
    advantage: "Crawls and tests OpenAPI, GraphQL schemas, and REST endpoints for mass assignment, introspection leaks, and rate limits.",
    features: ["GraphQL query depth checks", "OpenAPI automatic discovery", "Token privilege boundary tests"],
    link: "/solutions/api-penetration-testing",
  },
];

const faqs = [
  {
    question: "Why is BugSnaps MyPentest better than traditional vulnerability scanners?",
    answer:
      "Legacy scanners guess vulnerabilities by matching server version banners and regex patterns, generating up to 60% false positives. BugSnaps MyPentest uses active differential verification, sending test probes and negative controls to prove that a flaw is truly exploitable with concrete reproduction commands.",
  },
  {
    question: "How does BugSnaps compare to autonomous AI pentesting agents?",
    answer:
      "Autonomous AI agents often require you to supply personal OpenAI or Anthropic API keys, incurring unpredictable token bills while hallucinating non-existent vulnerabilities. BugSnaps uses deterministic, reproducible verification engines that require no external model keys and guarantee zero hallucinations.",
  },
  {
    question: "Can BugSnaps MyPentest test authenticated web applications?",
    answer:
      "Yes. BugSnaps supports authenticated testing using supplied session tokens or test credentials. In advanced modes, it leverages dual-account testing to verify Broken Object Level Authorization (BOLA) and multi-tenant isolation boundaries.",
  },
  {
    question: "How does BugSnaps pricing compare to enterprise tools like Qualys or Rapid7?",
    answer:
      "Enterprise tools require $15,000 to $40,000 annual contracts with high-pressure sales calls and expiring scan quotas. BugSnaps publishes all pricing transparently and offers flat pay-as-you-go scan packs with lifetime validity and zero seat-based penalties.",
  },
];

export default function UsVsCompetitorsPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Compare", path: "/compare" },
          { name: "BugSnaps vs Competitors", path: "/us-vs-competitors" },
        ]}
        eyebrow="Independent Benchmarks"
        title="BugSnaps vs Competitors: Sector Benchmarks & Accuracy Analysis"
        lead="See how BugSnaps MyPentest compares against legacy vulnerability scanners, open-source CLI tools, and autonomous AI agents across accuracy, setup, cost, and sectors."
      />

      {/* Hero Highlight Cards */}
      <Section labelledBy="highlights-title">
        <h2 id="highlights-title" className="sr-only">
          Core Differentiators
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
            <Zap className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-base font-semibold">Zero-Setup Hosted</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Run full assessments directly in your web browser. No Docker containers, Python virtual environments, or local proxy certificates.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
            <ShieldCheck className="h-6 w-6 text-success" />
            <h3 className="mt-4 text-base font-semibold">&lt; 1% False Positives</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every finding includes verified proof-of-exploit curl commands and differential response deltas, eliminating developer alert fatigue.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
            <Cpu className="h-6 w-6 text-blue-400" />
            <h3 className="mt-4 text-base font-semibold">Zero LLM Key Costs</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Deterministic rule engines execute reproducible checks without charging you OpenAI API fees or inventing fictional vulnerabilities.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            <h3 className="mt-4 text-base font-semibold">Flat Scan Packs</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pay-as-you-go pricing with lifetime validity. No $20,000 annual enterprise contracts or expiring monthly credits.
            </p>
          </div>
        </div>
      </Section>

      {/* Visual Sector Performance Graph */}
      <Section labelledBy="sector-graph-title" className="border-t border-white/[0.05] bg-surface/30">
        <div className="max-w-3xl">
          <h2 id="sector-graph-title" className="text-2xl font-semibold tracking-tight">
            Sector Performance &amp; Capability Benchmarks
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            How BugSnaps MyPentest performs across critical industry sectors compared to industry baseline averages:
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sectorCapabilities.map((item) => (
            <div key={item.sector} className="rounded-2xl border border-white/[0.08] bg-surface p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{item.sector}</h3>
                  <p className="mt-1 text-sm text-muted">{item.advantage}</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="font-mono text-xl font-bold text-accent">{item.score}%</span>
                  <span className="text-xs uppercase tracking-wider text-muted-2">Capability Score</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-2">
                <ul className="flex flex-wrap gap-2">
                  {item.features.map((feat) => (
                    <li key={feat} className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-foreground/90">
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={item.link} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                  View {item.sector.split(" ")[0]} Solution <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Head-to-Head Benchmark Table */}
      <Section labelledBy="benchmark-table-title" className="border-t border-white/[0.05]">
        <h2 id="benchmark-table-title" className="text-2xl font-semibold tracking-tight">
          Performance Benchmarks: BugSnaps vs Other Approaches
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          A side-by-side comparison of operational metrics between BugSnaps MyPentest, open-source scanners, and legacy enterprise suites:
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-surface">
                <th scope="col" className="px-5 py-4 font-mono text-[11px] uppercase tracking-wider text-muted-2">
                  Evaluation Dimension
                </th>
                <th scope="col" className="px-5 py-4 font-semibold text-accent">
                  BugSnaps MyPentest
                </th>
                <th scope="col" className="px-5 py-4 font-semibold text-foreground/80">
                  Open-Source Tools (ZAP, Nuclei)
                </th>
                <th scope="col" className="px-5 py-4 font-semibold text-foreground/80">
                  Legacy Enterprise (Qualys, Rapid7)
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row) => (
                <tr key={row.metric} className="border-b border-white/[0.06] hover:bg-white/[0.01]">
                  <th scope="row" className="px-5 py-4 font-medium text-foreground">
                    {row.metric}
                  </th>
                  <td className="px-5 py-4 font-medium text-accent">
                    {row.bugsnaps}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {row.openSource}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {row.legacyEnterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Dedicated Tool Comparisons Directory */}
      <Section labelledBy="directory-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="directory-title" className="text-2xl font-semibold tracking-tight">
          Direct Tool-by-Tool Comparison Breakdowns
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Read detailed, primary-source comparisons against individual tools, including capabilities, limitations, and pricing:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.slice(0, 9).map((c) => (
            <Link
              key={c.slug}
              href={versusPath(c.slug)}
              className="group flex flex-col rounded-xl border border-white/[0.08] bg-surface p-5 transition-colors hover:border-white/20"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-2">{c.category}</span>
              <span className="mt-2 font-semibold group-hover:text-accent">
                BugSnaps vs {c.name}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">{c.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">
                Read battlecard <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/compare" className="text-sm font-medium text-accent hover:underline">
            View all 15+ competitor comparisons in the Compare Hub →
          </Link>
        </div>
      </Section>

      {/* FAQ Section */}
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
