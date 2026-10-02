import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Resources: Guides, Use Cases and Comparisons",
  description: "Plan an authorized security assessment with practical guides, workflows for your application, and sourced comparisons of security testing tools.",
  path: "/resources",
});

const collections = [
  { title: "Security testing guides", path: "/guides", text: "Understand access control, API weaknesses, sessions, configuration and evidence. Each guide explains what to check, what a result means, and what still needs review." },
  { title: "Testing for your application", path: "/use-cases", text: "Build a scoped workflow for SaaS, ecommerce, multi-tenant services, authenticated applications and release checks. Start with roles and assets, then decide which tests fit." },
  { title: "Compare security tools", path: "/compare", text: "Compare MyPentest with named tools using vendor documentation. See strengths, limitations and when a different product is a better fit." },
  { title: "Tool alternatives", path: "/alternatives", text: "Choose an alternative by deployment, coverage, workflow and operating effort. Distinguish products that replace a task from those that complement it." },
  { title: "Security articles", path: "/blog", text: "Read practical explanations of assessment choices, authorization, scope and remediation." },
  { title: "Example assessment report", path: "/mypentest/example-report", text: "Inspect a sample finding and its evidence, severity, affected location and remediation. A sample is an illustration, not a result from your application." },
];

export default function ResourcesPage() {
  return <SiteShell>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "BugSnaps security testing resources", url: absoluteUrl("/resources"),
      mainEntity: { "@type": "ItemList", itemListElement: collections.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: absoluteUrl(c.path) })) } }} />
    <PageHeader crumbs={[{ name: "Resources", path: "/resources" }]} eyebrow="Security resources" title="Make the next security decision with evidence."
      lead="Start with a question, follow a workflow for your application, and compare tools against the tests and evidence you need." />
    <Section labelledBy="collections-title">
      <h2 id="collections-title" className="text-2xl font-semibold tracking-tight">Where to start</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{collections.map((c) => <li key={c.path}>
        <Link href={c.path} className="flex h-full flex-col rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20">
          <h3 className="text-lg font-semibold">{c.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{c.text}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm text-accent">Explore <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
      </li>)}</ul>
    </Section>
    <Section labelledBy="reading-title" className="border-t border-white/5">
      <h2 id="reading-title" className="text-2xl font-semibold tracking-tight">How to use these resources</h2>
      <div className="mt-5 grid gap-6 text-sm leading-relaxed text-muted md:grid-cols-3">
        <p><strong className="text-foreground">Scope first.</strong> Identify the owner, permitted hosts, test accounts and exclusions before an assessment. Only test systems you own or are authorized to test.</p>
        <p><strong className="text-foreground">Check the evidence.</strong> A tool's supported feature is not proof that every path in your application was tested. Read observed findings alongside unchecked paths and limitations.</p>
        <p><strong className="text-foreground">Read sources and dates.</strong> Our comparison pages cite vendor documentation and their review date. Guides link primary standards and testing references. Product availability can change.</p>
      </div>
      <p className="mt-6 text-sm text-muted">Written by BugSnaps, the provider of MyPentest. Tool comparisons include our own limitations. These resources do not certify regulatory compliance or guarantee that an application is free of vulnerabilities.</p>
      <Link href="/site-map" className="mt-5 inline-block text-sm text-accent hover:underline">Browse the complete site map</Link>
    </Section>
    <CtaBand />
  </SiteShell>;
}
