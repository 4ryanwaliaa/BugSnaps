import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { CompareTable } from "@/components/site/compare-page";
import { comparePages } from "@/lib/compare";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Compare Security Testing Options",
  description:
    "Vulnerability scanners, automated penetration testing and manual pentests compared across discovery, validation, authenticated testing, reporting, speed and cost.",
  path: "/compare",
});

export default function CompareHub() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Compare", path: "/compare" }]}
        eyebrow="Compare"
        title="Scanner, automated pentest, or manual test?"
        lead="An honest comparison of the ways to test a web application - including where our own products are not the right answer."
      />

      <Section labelledBy="guides-title">
        <h2 id="guides-title" className="text-2xl font-semibold tracking-tight">
          Comparisons
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {comparePages.map((page) => (
            <li key={page.slug} className="flex">
              <Link
                href={page.path}
                className="group flex w-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 transition-colors hover:border-white/15"
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
          We don&apos;t publish claims about specific competitors&apos; products. Category columns describe typical tools
          and engagements.
        </p>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
