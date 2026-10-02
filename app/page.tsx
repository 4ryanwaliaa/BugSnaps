import type { Metadata } from "next";
import Link from "next/link";
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
      <HomeWhy />
      <HomeResearch />
      <Section labelledBy="security-resources-title" className="border-t border-white/5">
        <h2 id="security-resources-title" className="text-2xl font-semibold">Plan your security assessment</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Understand what to test, choose a workflow for your application, and compare the tools that fit your scope.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { path: "/guides", title: "Practical security guides", text: "Access control, APIs, sessions, evidence and remediation." },
            { path: "/use-cases", title: "Workflows for your application", text: "SaaS, ecommerce, multi-tenant apps and release validation." },
            { path: "/alternatives", title: "Choose a testing tool", text: "Sourced alternatives with strengths and operating trade-offs." },
          ].map((item) => <Link key={item.path} href={item.path} className="rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20">
            <h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
          </Link>)}
        </div>
        <Link href="/resources" className="mt-6 inline-block text-sm text-accent hover:underline">All security resources</Link>
      </Section>
      <HomeClosing />
    </SiteShell>
  );
}
