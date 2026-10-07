import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SiteShell } from "@/components/site/page-parts";
import { HomeHero } from "@/components/home/hero";
import { HomeProducts } from "@/components/home/products";
import { HomeHowItRuns, HomeMarquee, HomeReport, HomeStats } from "@/components/home/sections";
import { HomeWhy } from "@/components/home/why";
import { HomeResearch } from "@/components/home/research";
import { HomeClosing } from "@/components/home/closing";
import { LegacyHashRedirect } from "@/components/home/legacy-hash-redirect";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "BugSnaps - Penetration Testing, Automated and Expert-Led",
  absoluteTitle: true,
  description:
    "Security testing that actually tests. Run MyPentest - our automated penetration test - free to start, or bring in the BugSnaps team for a manual engagement.",
  path: "/",
});

export default function Home() {
  return (
    <SiteShell>
      <LegacyHashRedirect />
      <HomeHero />
      <HomeMarquee />
      <HomeHowItRuns />
      <HomeStats />
      <HomeReport />
      <HomeProducts />

      {/* World-Ready Security & Trust Banner */}
      <Section labelledBy="world-ready-trust-title" className="border-t border-white/5">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.05] via-surface to-accent/[0.05] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                World-Ready Security
              </span>
              <h2 id="world-ready-trust-title" className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                You don&apos;t need to be insecure about the world: We&apos;ve got your back.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Assess your authorized application, review finding evidence and retest fixes. Use the coverage and reporting limits to decide when you need a separately scoped expert engagement.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/security-readiness"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                World-Ready Trust Center <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/benchmarks"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-foreground hover:bg-white/[0.08]"
              >
                Benchmark Methodology
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <HomeWhy />
      <HomeResearch />
      <Section labelledBy="security-resources-title" className="border-t border-white/5">
        <h2 id="security-resources-title" className="text-2xl font-semibold">
          Plan your security assessment
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Understand what to test, choose a workflow for your application, and compare the tools that fit your scope.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { path: "/guides", title: "Practical security guides", text: "Access control, APIs, sessions, evidence and remediation." },
            { path: "/use-cases", title: "Workflows for your application", text: "SaaS, ecommerce, multi-tenant apps and release validation." },
            { path: "/alternatives", title: "Choose a testing tool", text: "Sourced alternatives with strengths and operating trade-offs." },
          ].map((item) => (
            <Link key={item.path} href={item.path} className="rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </Link>
          ))}
        </div>
        <Link href="/resources" className="mt-6 inline-block text-sm text-accent hover:underline">
          All security resources
        </Link>
      </Section>
      <HomeClosing />
    </SiteShell>
  );
}
