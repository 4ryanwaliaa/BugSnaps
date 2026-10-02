import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { newAssessmentUrl, routes } from "@/lib/mypentest";
import { useCasePath, type SecurityUseCase } from "@/lib/security-use-cases";
import { ORG_ID, absoluteUrl, faqJsonLd } from "@/lib/site";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function SecurityUseCasePage({ item }: { item: SecurityUseCase }) {
  const path = useCasePath(item.slug);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#testing-plan`,
    headline: item.title,
    description: item.description,
    abstract: item.answer,
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
    datePublished: item.updated,
    dateModified: item.updated,
    author: { "@type": "Organization", "@id": ORG_ID, name: "BugSnaps" },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    citation: item.sources.map((source) => source.url),
  };

  return (
    <SiteShell>
      <JsonLd data={article} />
      <JsonLd data={faqJsonLd(item.faq)} />
      <article>
        <PageHeader
          crumbs={[{ name: "Use cases", path: "/use-cases" }, { name: item.label, path }]}
          eyebrow={`Testing plan · ${item.label}`}
          title={item.title}
          lead={item.description}
        >
          <p className="text-sm text-muted-2">By BugSnaps · Updated <time dateTime={item.updated}>{formatDate(item.updated)}</time></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={newAssessmentUrl()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-accent">
              Start an authorized assessment <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href={routes.exampleReport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-2 text-sm text-muted hover:text-foreground">
              <FileText className="h-4 w-4" aria-hidden="true" /> View an example report
            </Link>
          </div>
        </PageHeader>

        <Section labelledBy="answer-title">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              <h2 id="answer-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{item.question}</h2>
              <p className="mt-5 text-lg leading-relaxed text-foreground">{item.answer}</p>
              <p className="mt-5 text-[16px] leading-relaxed text-muted">{item.context}</p>
            </div>
            <nav aria-label="On this page" className="h-fit rounded-2xl border border-white/[0.08] bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-2">On this page</p>
              <ul className="mt-4 space-y-3 text-sm">
                {[{ label: "Assets and roles", href: "#scope" }, { label: "Preparation", href: "#preparation" }, { label: "Testing workflow", href: "#workflow" }, { label: "Evidence to keep", href: "#evidence" }, { label: "Automation and manual review", href: "#limits" }, { label: "Questions and sources", href: "#questions" }].map((link) => (
                  <li key={link.href}><a href={link.href} className="text-accent hover:underline">{link.label}</a></li>
                ))}
              </ul>
            </nav>
          </div>
        </Section>

        <Section id="scope" labelledBy="scope-title" className="scroll-mt-24 border-t border-white/[0.05] bg-surface/30">
          <SectionTitle id="scope-title" eyebrow="Scope" title="Define the assets, actors and boundaries." lead="Use this plan to agree an assessment scope. The exact checks depend on your application, authorization and available test access." />
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Assets, test roles and priorities for {item.label.toLowerCase()}</caption>
              <thead className="bg-surface"><tr className="border-b border-white/[0.08]">
                <th scope="col" className="w-[30%] px-5 py-4 font-semibold">Asset or journey</th>
                <th scope="col" className="w-[30%] px-5 py-4 font-semibold">Test contexts</th>
                <th scope="col" className="px-5 py-4 font-semibold">Priority</th>
              </tr></thead>
              <tbody>{item.scope.map((row) => <tr key={row.asset} className="border-b border-white/[0.06] last:border-0">
                <th scope="row" className="px-5 py-4 align-top font-medium">{row.asset}</th>
                <td className="px-5 py-4 align-top leading-relaxed text-muted">{row.roles}</td>
                <td className="px-5 py-4 align-top leading-relaxed text-muted">{row.priority}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </Section>

        <Section id="preparation" labelledBy="preparation-title" className="scroll-mt-24 border-t border-white/[0.05]">
          <SectionTitle id="preparation-title" eyebrow="Before the assessment" title="Prepare representative access and a clear scope." />
          <ul className="mt-7 max-w-3xl list-disc space-y-4 pl-5 text-[16px] leading-relaxed text-muted">
            {item.preparation.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-2">Only test systems you own or have explicit permission to assess. Agree target boundaries, data handling and stop conditions before active testing.</p>
        </Section>

        <Section id="workflow" labelledBy="workflow-title" className="scroll-mt-24 border-t border-white/[0.05] bg-surface/30">
          <SectionTitle id="workflow-title" eyebrow="Workflow" title="Move from a baseline to verified repairs." />
          <ol className="mt-9 grid gap-5 md:grid-cols-2">
            {item.workflow.map((step, index) => <li key={step.title} className="rounded-2xl border border-white/[0.08] bg-surface p-6">
              <p className="font-mono text-xs text-accent">Step {index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.detail}</p>
            </li>)}
          </ol>
        </Section>

        <Section id="evidence" labelledBy="evidence-title" className="scroll-mt-24 border-t border-white/[0.05]">
          <SectionTitle id="evidence-title" eyebrow="Report evidence" title="Keep enough detail to verify and repair the issue." lead="Use controlled records, remove secrets and keep the result tied to the permission or workflow that failed." />
          <ul className="mt-7 max-w-3xl list-disc space-y-4 pl-5 text-[16px] leading-relaxed text-muted">
            {item.evidence.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <div className="mt-8 max-w-3xl rounded-2xl border border-white/[0.08] bg-surface p-6">
            <h3 className="text-lg font-semibold">Use the evidence in the release decision</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.releaseDecision}</p>
          </div>
        </Section>

        <Section id="limits" labelledBy="limits-title" className="scroll-mt-24 border-t border-white/[0.05] bg-surface/30">
          <SectionTitle id="limits-title" eyebrow="Coverage and limits" title="Know what automation establishes and what needs a reviewer." />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
              <h3 className="text-lg font-semibold">Automated baseline</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.automation}</p>
              <Link href="/mypentest" className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">Review MyPentest's scope <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-6">
              <h3 className="text-lg font-semibold">Human review</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.humanReview}</p>
              <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">Discuss the assessment scope <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </Section>

        <Section id="questions" labelledBy="questions-title" className="scroll-mt-24 border-t border-white/[0.05]">
          <SectionTitle id="questions-title" eyebrow="Common questions" title={`Questions about testing ${item.label.toLowerCase()}.`} />
          <div className="mt-8 max-w-3xl divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-surface">
            {item.faq.map((faq) => <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium"><span>{faq.question}</span><span aria-hidden="true" className="text-muted group-open:rotate-45">+</span></summary>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>)}
          </div>
        </Section>

        <Section labelledBy="references-title" className="border-t border-white/[0.05] bg-surface/30">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 id="references-title" className="text-2xl font-semibold tracking-tight">References for this testing plan</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">These primary references inform the testing approach. They are not endorsements of BugSnaps or claims that a product implements every test in a standard.</p>
              <ul className="mt-6 space-y-5">{item.sources.map((source) => <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm text-accent hover:underline">{source.label}<ArrowUpRight className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" /></a>
                <p className="mt-2 text-sm leading-relaxed text-muted">{source.relevance}</p>
              </li>)}</ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Related guides and testing plans</h2>
              <ul className="mt-6 space-y-3">{item.related.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">{link.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></li>)}</ul>
              <Link href="/use-cases" className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">All testing use cases <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </Section>
      </article>
    </SiteShell>
  );
}
