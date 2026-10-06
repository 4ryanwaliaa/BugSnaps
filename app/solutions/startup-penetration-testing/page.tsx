import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Clock, DollarSign, ArrowRight, CheckCircle2, ShieldCheck, Rocket } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Penetration Testing for Startups: Fast, Affordable & Auditor-Ready",
  description:
    "Fast, affordable penetration testing built for growing startups: close enterprise deals, satisfy SOC 2 and ISO 27001 requirements, and eliminate vulnerabilities without enterprise contracts.",
  path: "/solutions/startup-penetration-testing",
});

const faqs = [
  {
    question: "When should an early-stage startup get a penetration test?",
    answer:
      "Startups should test before processing customer production data, when preparing for enterprise security reviews, or when pursuing SOC 2 / ISO 27001 certifications. Testing proactively prevents stalled sales cycles.",
  },
  {
    question: "How long does a BugSnaps startup assessment take?",
    answer:
      "Automated testing with MyPentest delivers verified findings in minutes directly in your browser. Certified human expert engagements are completed and delivered within days, not weeks.",
  },
  {
    question: "Do enterprise customers accept BugSnaps reports during procurement reviews?",
    answer:
      "Yes. BugSnaps deliverables include executive summary letters, CVSS v3.1 scoring, CWE mappings, and signed retest attestations designed specifically for enterprise vendor risk management teams.",
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
        title="Penetration Testing for Startups: Fast, Affordable & Auditor-Ready"
        lead="Stop enterprise sales deals from stalling on security questionnaires. Get auditor-approved penetration test reports within days without $20,000 enterprise lock-in."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Built for Agile Startups Moving at High Velocity
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Enterprise prospects and compliance auditors demand third-party penetration testing before signing software agreements. Yet traditional security consultancies take weeks to schedule scoping calls and charge five-figure fees. BugSnaps provides immediate, hosted testing that matches agile startup sprint cycles.
        </p>

        {/* Sector Capability Benchmark */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Sector Benchmark</span>
              <h3 className="mt-1 text-lg font-semibold">Startup Time-to-Scan &amp; Cost Efficiency Score</h3>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">98% vs 38%</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            BugSnaps delivers zero-setup browser testing and flat-rate scan packs, reducing startup security costs by up to 80%.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: "98%" }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Zero Wait Time</h3>
            <p className="mt-2 text-sm text-muted">
              Start testing immediately through your browser with MyPentest. No sales calls or procurement delays.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Predictable Flat Pricing</h3>
            <p className="mt-2 text-sm text-muted">
              Transparent scan packs with lifetime validity. Never pay for unused monthly enterprise subscriptions.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Rocket className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Enterprise Deal Enablement</h3>
            <p className="mt-2 text-sm text-muted">
              Deliver professional executive summaries that satisfy enterprise vendor risk security questionnaires.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          How BugSnaps Compares Against Traditional Security Consultancies
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Traditional firms require multiple weeks of planning and deliver static 100-page PDF reports. BugSnaps gives developers actionable reproduction curl commands and instant retesting.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Inspect all benchmarks in BugSnaps vs Competitors <ArrowRight className="h-3.5 w-3.5" />
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

      <CtaBand />
    </SiteShell>
  );
}
