import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    "Compare MyPentest with 15 security tools, including Nuclei, Burp, ZAP, XBOW and enterprise DAST. Sourced features, workflow fit and limitations on both sides.",
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
