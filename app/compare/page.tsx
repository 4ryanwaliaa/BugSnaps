import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { CtaBand, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { CompareTable } from "@/components/site/compare-page";
import { AllToolsMatrix, SupportLegend } from "@/components/site/versus-page";
import { comparePages } from "@/lib/compare";
import { ALTERNATIVE_PAGES, alternativePath } from "@/lib/alternatives";
import { HUB_FEATURES, competitors, formatCheckedOn, versusPath } from "@/lib/competitors";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Compare Security Testing Options",
  description:
    "Compare MyPentest with 20 security tools, including Acunetix, Nessus, Veracode, Checkmarx, Cobalt, Nuclei, Burp, ZAP, and enterprise DAST. Sourced features, workflow fit and limitations.",
  path: "/compare",
});

export default function CompareHub() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Compare", path: "/compare" }]}
        eyebrow="Compare"
        title="MyPentest vs the alternatives."
        lead="Honest, sourced comparisons with the tools you're probably weighing up - including where MyPentest is not the right answer."
      />
      <Section labelledBy="benchmarks-banner-title" className="pb-0">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">Benchmark Methodology</span>
            <h2 id="benchmarks-banner-title" className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              Reproducible Pentesting Evaluation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Compare precision, recall, evidence, setup time and total cost using a shared test protocol. Head-to-head measurements are pending.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/benchmarks"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                View Benchmarks <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/us-vs-competitors"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.04]"
              >
                Competitor Battlecards
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">Trust &amp; Safety</span>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              World-Ready Security &amp; Trust Center
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Learn how BugSnaps keeps you out of trouble: 4 vulnerability severity levels, non-destructive safety guarantees, and audit-ready attestation.
            </p>
            <div className="mt-4">
              <Link
                href="/security-readiness"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
              >
                Explore Security Readiness <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="tools-title">
        <h2 id="tools-title" className="text-2xl font-semibold tracking-tight">
          MyPentest vs named tools
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Features, trade-offs and pricing models based on primary vendor sources. Compare the exact edition and
          test your required workflow; these pages do not claim measured detection superiority.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((c) => (
            <li key={c.slug} className="flex">
              <Link
                href={versusPath(c.slug)}
                className="group flex w-full flex-col spot rounded-2xl border border-white/[0.07] bg-surface p-6 transition-colors hover:border-white/15"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">{c.category}</span>
                <span className="mt-2 text-[17px] font-semibold">
                  MyPentest <span className="text-muted-2">vs</span> {c.name}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.summary}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent">
                  Compare
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="matrix-title" className="border-t border-white/[0.05] bg-surface/40">
        <h2 id="matrix-title" className="mb-6 text-2xl font-semibold tracking-tight">
          Everything at a glance
        </h2>
        <AllToolsMatrix features={HUB_FEATURES} />
        <SupportLegend />
        <p className="mt-3 text-[12.5px] text-muted-2">
          Each comparison page has the full notes and primary sources. Vendor descriptions reviewed{" "}
          {formatCheckedOn(competitors[0].checkedOn)}. Unstated means the sources do not establish a capability;
          it does not mean the product lacks it.
        </p>
      </Section>

      <Section labelledBy="alternatives-title" className="border-t border-white/[0.05]">
        <h2 id="alternatives-title" className="text-2xl font-semibold tracking-tight">
          Evaluate alternatives by the job you need done
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Selection guides include a practical shortlist, reasons to keep the original tool, checks to run in
          staging and a transition plan. They distinguish source analysis, runtime tests, infrastructure and
          manual investigation instead of treating every security product as interchangeable.
        </p>
        <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALTERNATIVE_PAGES.map((page) => (
            <li key={page.slug}><Link href={alternativePath(page.slug)} className="text-sm text-accent hover:underline">{competitors.find((tool) => tool.slug === page.competitorSlug)?.name} alternatives</Link></li>
          ))}
        </ul>
        <Link href="/alternatives" className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
          Browse all selection guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Section>

      <Section labelledBy="guides-title" className="border-t border-white/[0.05]">
        <h2 id="guides-title" className="text-2xl font-semibold tracking-tight">
          Compare by approach
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {comparePages.map((page) => (
            <li key={page.slug} className="flex">
              <Link
                href={page.path}
                className="group flex w-full flex-col spot rounded-2xl border border-white/[0.07] bg-surface p-6 transition-colors hover:border-white/15"
              >
                <span className="text-[15px] font-semibold">{page.metaTitle}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{page.lead}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent">
                  Read the comparison
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="all-title" className="border-t border-white/[0.05]">
        <h2 id="all-title" className="mb-6 text-2xl font-semibold tracking-tight">
          All four, side by side
        </h2>
        <CompareTable columns={["scanner", "mypentest", "manual", "bugsnaps"]} />
        <p className="mt-3 text-[12.5px] text-muted-2">
          Category columns describe typical tools and engagements; the named-tool pages above cite each product&apos;s
          own site.
        </p>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
