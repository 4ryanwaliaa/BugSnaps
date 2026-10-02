import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { ALTERNATIVE_GROUPS, ALTERNATIVE_PAGES, alternativePage, alternativePath } from "@/lib/alternatives";
import { competitor } from "@/lib/competitors";
import { absoluteUrl, faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Alternatives by Workflow",
  description: "Explore 15 security-tool selection guides for DAST, open-source scanners, manual toolkits and AI pentesting. Compare scope, evidence, deployment and trade-offs.",
  path: "/alternatives",
});
const faq = [
  { question: "How do I choose a security testing alternative?", answer: "Start with the required surface and workflow: source code, running applications, networks, manual investigation or agent-driven exploit validation. Then test the actual login, deployment and evidence on the same authorized staging app." },
  { question: "Are these tools all interchangeable?", answer: "No. Products and editions cover different surfaces. A source-code analyzer, runtime scanner and manual toolkit can complement one another rather than replace one another." },
  { question: "Are these rankings based on a head-to-head benchmark?", answer: "No. The guides use primary vendor sources for product descriptions and editorial criteria for evaluation. They do not claim measured detection superiority or guaranteed vulnerability coverage." },
];

export default function AlternativesHub() {
  return (
    <SiteShell footer="mypentest">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList",
        name: "Security testing alternative selection guides",
        itemListElement: ALTERNATIVE_PAGES.map((page, index) => ({
          "@type": "ListItem", position: index + 1, name: page.title, url: absoluteUrl(alternativePath(page.slug)),
        })),
      }} />
      <PageHeader
        crumbs={[{ name: "Alternatives", path: "/alternatives" }]}
        eyebrow="Selection guides"
        title="Find the testing workflow your team needs."
        lead="Fifteen practical guides for choosing a security tool by scope, evidence and operating effort. Each explains when to keep the original tool and where MyPentest has limits."
      />
      <Section labelledBy="decision-title">
        <h2 id="decision-title" className="text-2xl font-semibold tracking-tight">Start with the job, then the product.</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-3 text-[15px] leading-relaxed text-muted">
          <p><strong className="text-foreground">Define the surface.</strong> Code, dependencies, APIs, web applications and infrastructure need different coverage. Buying one scanner does not establish that every surface is assessed.</p>
          <p><strong className="text-foreground">Define the workflow.</strong> A local release gate, a hosted assessment and a manual engagement solve different problems. Check private-target access, operator skill, authentication and reporting requirements.</p>
          <p><strong className="text-foreground">Define acceptable proof.</strong> Review reproducible evidence and missed known cases on an authorized staging build. Feature counts, a clean run and a polished report do not guarantee detection quality.</p>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-2">
          These are selection guides, not benchmark rankings. Vendor claims are linked to primary sources, and recommendations are our editorial assessment of workflow fit. MyPentest is a narrower hosted web-app product with explicit discovery and authentication limits.
        </p>
        <Link href="/compare" className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">See feature-by-feature comparisons <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </Section>
      {ALTERNATIVE_GROUPS.map((group, index) => (
        <Section key={group.title} labelledBy={`group-${index}`} className="border-t border-white/[0.05]">
          <h2 id={`group-${index}`} className="text-2xl font-semibold tracking-tight">{group.title}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.slugs.map((slug) => {
              const page = alternativePage(slug);
              const tool = competitor(slug);
              if (!page || !tool) return null;
              return <li key={slug} className="flex"><Link href={alternativePath(slug)} className="group flex w-full flex-col rounded-2xl border border-white/[0.07] bg-surface p-6 hover:border-white/15">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-2">{tool.category}</span>
                <span className="mt-2 text-lg font-semibold">{tool.name} alternatives</span>
                <span className="mt-3 flex-1 text-sm leading-relaxed text-muted">{page.answer}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm text-accent">Choose by workflow <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link></li>;
            })}
          </ul>
        </Section>
      ))}
      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">Common selection questions</h2>
        <dl className="mt-6 max-w-3xl space-y-6">{faq.map((item) => <div key={item.question}><dt className="font-semibold">{item.question}</dt><dd className="mt-2 text-[15px] leading-relaxed text-muted">{item.answer}</dd></div>)}</dl>
      </Section>
      <CtaBand title="See what a MyPentest report includes." />
    </SiteShell>
  );
}
