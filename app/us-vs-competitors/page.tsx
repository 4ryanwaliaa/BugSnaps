import Link from "next/link";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { competitors, versusPath } from "@/lib/competitors";
import { faqJsonLd, pageMetadata } from "@/lib/site";
export const metadata = pageMetadata({
  title: "BugSnaps vs Competitors: Strix, XBOW, Burp and DAST Tools",
  description: "Compare BugSnaps MyPentest with Strix, XBOW, Burp, ZAP and enterprise scanners. Sourced strengths, limitations, deployment choices and a fair benchmark method.",
  path: "/us-vs-competitors",
});
const faqs = [
  { question: "Is BugSnaps MyPentest better than Strix?", answer: "No published head-to-head measurement establishes a detection winner. MyPentest fits hosted, defined-check web assessments. Evaluate Strix for agent exploration, source context and fix proposals. Choose using your required scope and a controlled trial." },
  { question: "What are MyPentest's strengths and limitations?", answer: "MyPentest offers a browser workflow, evidence and remediation without a personal model key. Its automated product does not provide source-code analysis, general exploit chains, network assessments or native CI integration. Discovery and supplied credentials limit coverage." },
  { question: "How should I compare competitor pricing?", answer: "Compare the same target count, authentication needs, scan allowance, report access and retest requirements. For local agents, include model and infrastructure costs. For hosted platforms, check the exact edition and billing terms rather than unrelated entry prices." },
];
const ordered = [...competitors].sort((a, b) => Number(b.slug === "strix") - Number(a.slug === "strix"));
export default function UsVsCompetitorsPage() {
  return <SiteShell>
    <JsonLd data={faqJsonLd(faqs)} />
    <PageHeader crumbs={[{ name: "Compare", path: "/compare" }, { name: "BugSnaps vs competitors", path: "/us-vs-competitors" }]} eyebrow="Sourced product comparisons" title="BugSnaps vs competitors: choose by scope and evidence." lead="MyPentest is a hosted assessment for deployed web applications and APIs. Compare it with agents, operator toolkits and enterprise scanners using the job you need done." />
    <Section labelledBy="strix-title"><SectionTitle id="strix-title" title="MyPentest vs Strix: the practical difference." lead="MyPentest runs defined checks and reports evidence and confidence. Strix describes an agent-driven workflow with source context, exploit validation and fix proposals. The approaches have different coverage and operating requirements." />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-accent/30 bg-surface p-6"><h3 className="font-semibold">Choose MyPentest when</h3><p className="mt-3 text-sm leading-relaxed text-muted">You want an occasional hosted assessment without installing a scanner or supplying a personal model key, and can verify the target and provide scoped test accounts. Review evidence and retest fixes; use a separate expert engagement for deeper business-logic testing.</p><Link className="mt-4 inline-block text-sm text-accent" href="/mypentest/example-report">Review an example report</Link></div>
        <div className="rounded-2xl border border-white/10 bg-surface p-6"><h3 className="font-semibold">Evaluate Strix when</h3><p className="mt-3 text-sm leading-relaxed text-muted">Source-assisted exploration, agent-driven tests or proposed code fixes matter. Distinguish local from managed cloud, and inspect permitted actions, data handling and current billing before running an assessment.</p><a className="mt-4 inline-block text-sm text-accent" href="https://github.com/usestrix/strix">Read the official Strix project</a></div>
      </div>
      <div className="mt-6 flex flex-wrap gap-5 text-sm text-accent"><Link href="/compare/mypentest-vs-strix">Full Strix comparison</Link><Link href="/alternatives/strix">Strix alternatives</Link><Link href="/benchmarks">Reproducible benchmark protocol</Link></div>
      <p className="mt-5 text-sm text-muted">BugSnaps publishes these comparisons. They are editorial product-scope evaluations, not independent performance rankings. No comparative detection score is claimed.</p>
    </Section>
    <Section labelledBy="tools-title" className="border-t border-white/10"><SectionTitle id="tools-title" title="Compare each tool's strengths and limitations." lead="Each comparison includes sources, an edition-specific feature matrix, pricing context and reasons to choose either product." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ordered.map(c => <Link key={c.slug} href={versusPath(c.slug)} className="rounded-xl border border-white/10 bg-surface p-5 transition-colors hover:border-accent/50"><p className="text-xs text-muted">{c.category}</p><h3 className="mt-2 font-semibold">MyPentest vs {c.name}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{c.summary}</p><p className="mt-4 text-xs text-muted">Sources reviewed: {c.checkedOn}</p></Link>)}</div></Section>
    <Section labelledBy="faq-title" className="border-t border-white/10"><SectionTitle id="faq-title" title="Competitor comparison questions." /><div className="mt-8 space-y-4">{faqs.map(f => <details key={f.question} className="rounded-xl border border-white/10 p-5"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p></details>)}</div></Section>
    <CtaBand />
  </SiteShell>;
}
