import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { ALTERNATIVE_PAGES, alternativePage, alternativePath } from "@/lib/alternatives";
import { competitor, formatCheckedOn, versusPath } from "@/lib/competitors";
import { routes } from "@/lib/mypentest";
import { ORG_ID, absoluteUrl, faqJsonLd, pageMetadata } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return ALTERNATIVE_PAGES.map((page) => ({ slug: page.slug })) }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = alternativePage((await params).slug);
  return page ? pageMetadata({ title: page.title, description: page.description, path: alternativePath(page.slug) }) : {};
}

export default async function AlternativeGuide({ params }: Params) {
  const page = alternativePage((await params).slug);
  if (!page) notFound();
  const tool = competitor(page.competitorSlug);
  if (!tool) notFound();
  const related = page.options.map((option) => ({ ...option, tool: competitor(option.slug) })).filter((option) => option.tool);
  return (
    <SiteShell footer="mypentest">
      <JsonLd data={faqJsonLd(page.faq)} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article",
        headline: page.title, description: page.description,
        mainEntityOfPage: absoluteUrl(alternativePath(page.slug)),
        dateModified: page.updated, inLanguage: "en",
        author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID },
        about: { "@type": "SoftwareApplication", name: tool.name, url: tool.website },
        citation: tool.sources.map((source) => source.url),
      }} />
      <PageHeader
        crumbs={[{ name: "Alternatives", path: "/alternatives" }, { name: `${tool.name} alternatives`, path: alternativePath(page.slug) }]}
        eyebrow={`Selection guide · ${tool.category}`}
        title={`${tool.name} alternatives: choose by workflow.`}
        lead={page.answer}
      >
        <p className="text-sm text-muted-2">Vendor sources reviewed {formatCheckedOn(page.updated)}. Selection criteria are editorial, with no claim of a measured detection ranking.</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-accent">
          <Link href={versusPath(tool.slug)} className="inline-flex items-center gap-2 hover:underline">MyPentest vs {tool.name} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link href="#sources" className="hover:underline">Review primary sources</Link>
        </div>
      </PageHeader>
      <Section labelledBy="keep-title">
        <h2 id="keep-title" className="text-2xl font-semibold tracking-tight">When keeping {tool.name} makes sense</h2>
        <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{page.keepOriginal}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-2">Changing tools should solve a documented coverage or workflow problem. Preserve requirements that the current process already meets before comparing a simpler interface or entry price.</p>
        <a href={tool.sources[0].url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">Vendor scope and documentation <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
      </Section>
      <Section labelledBy="shortlist-title" className="border-t border-white/[0.05] bg-surface/40">
        <h2 id="shortlist-title" className="text-2xl font-semibold tracking-tight">A shortlist for different needs</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">These options have different purposes and are not ranked. Validate the required edition and scope in a pilot before treating one as a replacement.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-primary/30 bg-surface p-6">
            <h3 className="text-lg font-semibold">MyPentest</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">Consider it for an occasional browser-based assessment of a verified web app and discovered APIs, with evidence and remediation in the report.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted"><strong className="text-foreground">Check the gap:</strong> No source analysis, network audit, custom rules, general exploit chains or native CI integration. Supplied credentials and reachable routes limit authenticated coverage.</p>
            <Link href={routes.exampleReport} className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">Inspect an example report <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {related.map((option) => <div key={option.slug} className="rounded-2xl border border-white/[0.07] bg-surface p-6">
            <h3 className="text-lg font-semibold">{option.tool!.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{option.fit}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted"><strong className="text-foreground">Check the gap:</strong> {option.check}</p>
            <a href={option.tool!.sources[0].url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">Vendor product details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            <Link href={alternativePath(option.slug)} className="mt-3 block text-sm text-accent hover:underline">{option.tool!.name} selection guide</Link>
          </div>)}
        </div>
      </Section>
      <Section labelledBy="evaluate-title" className="border-t border-white/[0.05]">
        <h2 id="evaluate-title" className="text-2xl font-semibold tracking-tight">What to verify before changing tools</h2>
        <ol className="mt-6 max-w-4xl space-y-6">
          {page.checks.map((check, index) => <li key={check.title} className="flex gap-4">
            <span className="mt-0.5 font-mono text-sm text-accent" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3 className="font-semibold">{check.title}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{check.body}</p></div>
          </li>)}
        </ol>
      </Section>
      <Section labelledBy="transition-title" className="border-t border-white/[0.05] bg-surface/40">
        <h2 id="transition-title" className="text-2xl font-semibold tracking-tight">Plan a verifiable transition</h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">{page.transition}</p>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">Agree ownership and written scope, use suitable test accounts, and define permitted actions. Prefer a representative staging target for evaluation. Report failed logins, unreachable areas and excluded checks explicitly instead of calling them secure.</p>
      </Section>
      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">{tool.name} alternatives: common questions</h2>
        <dl className="mt-6 max-w-3xl space-y-6">{page.faq.map((item) => <div key={item.question}><dt className="font-semibold">{item.question}</dt><dd className="mt-2 text-[15px] leading-relaxed text-muted">{item.answer}</dd></div>)}</dl>
      </Section>
      <Section labelledBy="sources-title" id="sources" className="border-t border-white/[0.05] bg-surface/40">
        <h2 id="sources-title" className="text-2xl font-semibold tracking-tight">Primary vendor sources</h2>
        <ul className="mt-5 space-y-3">{tool.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">{source.label}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></li>)}</ul>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-2">Checked {formatCheckedOn(page.updated)}. Plans and capabilities change. {tool.name} is a trademark of its owner; BugSnaps is not affiliated with {tool.vendor}. This is a BugSnaps editorial guide, with our product included and its limits disclosed.</p>
        <div className="mt-5 flex flex-wrap gap-5 text-sm text-accent">
          <Link href="/alternatives" className="hover:underline">All alternative guides</Link>
          <Link href="/compare" className="hover:underline">All product comparisons</Link>
          <Link href="/penetration-testing" className="hover:underline">Scope a manual engagement</Link>
          <Link href="/contact" className="hover:underline">Suggest a source correction</Link>
        </div>
      </Section>
      <CtaBand title="Review the evidence before choosing a scanner." />
    </SiteShell>
  );
}
