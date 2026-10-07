import Link from "next/link";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Why BugSnaps? Web and API Security Testing with Evidence",
  description: "See why teams try BugSnaps MyPentest: a hosted assessment for verified web apps, authenticated checks, finding evidence, remediation and clear coverage limits.",
  path: "/why-bugsnaps",
});

const reasons = [
  { title: "Start from your deployed app", body: "Assess the web application users actually reach. MyPentest discovers pages, APIs and login surfaces, then runs defined checks against reachable endpoints within your configured scope.", href: "/mypentest", label: "Explore supported coverage" },
  { title: "Bring the right test accounts", body: "Public pages show only part of an application. Supported signed-in testing uses accounts you supply, including suitable account pairs for checks across user access boundaries.", href: "/guides", label: "Read testing preparation guides" },
  { title: "Give developers finding evidence", body: "Review the affected surface, severity, confidence and remediation. Use evidence to decide what needs investigation and what change your team can verify.", href: "/mypentest/example-report", label: "Inspect an illustrative report" },
  { title: "Use a hosted workflow", body: "Run the assessment in your browser without installing a local scanner or providing a personal model API key. Review current scan allowances, target limits and report access before you start.", href: "/pricing", label: "Check current plans" },
  { title: "Return to the assessment", body: "Where your plan includes saved history, review findings while working on a fix. After your team changes the application, rerun the relevant assessment and investigate whether the reported behavior changed.", href: "/improvements", label: "See current workflow improvements" },
  { title: "Expand the scope when needed", body: "BugSnaps also offers separately scoped expert engagements. Discuss business logic, deeper investigation or wider infrastructure requirements when an automated web assessment cannot answer your question.", href: "/contact", label: "Discuss an expert engagement" },
];

const faqs = [
  { question: "Why should I give BugSnaps MyPentest a try?", answer: "Try it if you need a hosted assessment of a verified deployed web application, can provide appropriate test accounts and want evidence and remediation in one workflow. Start with a small staging target and assess whether the report helps your team investigate and fix a real issue. Check current plan and report limits first." },
  { question: "Is BugSnaps better than every AI pentesting tool?", answer: "No published head-to-head measurement establishes that claim. The useful comparison is the scope you need, the evidence delivered, the setup and review effort, and the total cost. BugSnaps publishes sourced comparisons and a reproducible benchmark protocol so you can make that decision." },
  { question: "Can I use MyPentest to test another company's website?", answer: "Only if you have authorization to test that target and can complete the domain verification required by the workflow. Define the permitted scope and accounts before testing. Domain verification is a technical control and does not replace permission from the target owner." },
  { question: "Does a report certify compliance or prove my app is secure?", answer: "No. The report records findings from the supported assessment. Coverage depends on discovery, credentials and selected checks. A clean result is not a security guarantee, and an automated report does not by itself establish compliance certification." },
];

export default function WhyBugSnapsPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader crumbs={[{ name: "Why BugSnaps", path: "/why-bugsnaps" }]} eyebrow="Find. Fix. Fortify." title="Security testing your team can act on." lead="BugSnaps MyPentest connects a verified web application with finding evidence and remediation. Give it a try when you want a hosted assessment with a clear path to review and fix.">
        <div className="flex flex-wrap gap-3"><Link href="/mypentest" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-accent">Explore MyPentest</Link><Link href="/mypentest/example-report" className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium hover:border-accent/50">View an example report</Link></div>
      </PageHeader>

      <Section labelledBy="reasons-title">
        <SectionTitle id="reasons-title" title="What makes the workflow useful." lead="A security finding becomes useful when someone can investigate it, decide on a fix and check the result. These are the practical reasons to evaluate MyPentest." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{reasons.map(reason => <article key={reason.title} className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6"><h3 className="font-semibold">{reason.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{reason.body}</p><Link href={reason.href} className="mt-5 text-sm text-accent hover:underline">{reason.label}</Link></article>)}</div>
      </Section>

      <Section labelledBy="workflow-title" className="border-t border-white/10 bg-surface/30">
        <SectionTitle id="workflow-title" title="From a target to a reviewed fix." lead="Keep scope and evidence visible at each step. An AI coding assistant can help implement a change; your team still reviews the patch and the test result." />
        <figure className="mt-8 rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Verify", text: "Authorized domain, DNS control and agreed boundaries." },
              { title: "Assess", text: "Discovery, selected mode and supported test accounts." },
              { title: "Review", text: "Evidence, confidence, severity and a fix plan." },
              { title: "Reassess", text: "Reviewed change and another comparable assessment." },
            ].map((step, index) => <li key={step.title} className="rounded-xl border border-accent/20 bg-accent/[0.04] p-5"><span className="font-mono text-xs text-accent">Step {index + 1}</span><h3 className="mt-3 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p></li>)}
          </ol>
          <figcaption className="mt-5 text-xs leading-relaxed text-muted">Assessment workflow illustration. Reassessment means starting another assessment after a fix; scheduled retests and automatic finding comparison are not included in this illustration.</figcaption>
        </figure>
      </Section>

      <Section labelledBy="fit-title" className="border-t border-white/10">
        <SectionTitle id="fit-title" title="Choose by the application and the question." />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-accent/25 bg-surface p-6"><h3 className="font-semibold">A practical fit for MyPentest</h3><ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted"><li>A reachable, deployed web application or API surface you can verify.</li><li>An occasional assessment without maintaining a local scanner setup.</li><li>Suitable test accounts and time to review coverage and findings.</li><li>A team that can apply changes and reassess the reported behavior.</li></ul></article>
          <article className="rounded-2xl border border-white/10 bg-surface p-6"><h3 className="font-semibold">Requirements to evaluate separately</h3><ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted"><li>Source-code analysis, custom scanner rules or native CI integration.</li><li>Network or cloud-configuration assessments.</li><li>Business-logic abuse, general exploit chains or deeper manual investigation.</li><li>Compliance requirements that need a specific engagement and deliverable.</li></ul></article>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">The automated assessment has defined coverage. A reachable URL, a configured account or a clean run cannot establish that every application flow has been tested. Review gaps and decide what needs a different tool or expert work.</p>
      </Section>

      <Section labelledBy="evidence-title" className="border-t border-white/10"><SectionTitle id="evidence-title" title="Let the evidence decide which tool is better for you." lead="Use the same staging target, accounts and known test cases when comparing tools. Review confirmed findings, missed cases, triage time, setup and cost. A product label or a long list of features cannot answer those questions." /><div className="mt-7 grid gap-4 md:grid-cols-3">{[{ href: "/benchmarks", title: "Benchmark methodology", body: "A reproducible protocol and the status of published measurements." }, { href: "/us-vs-competitors", title: "Security tool comparisons", body: "Named products, primary sources and trade-offs on both sides." }, { href: "/compare/mypentest-vs-ai-assistants", title: "AI assistants and automation", body: "Where ChatGPT, Claude Code and workflow tools fit alongside an assessment." }].map(item => <Link key={item.href} href={item.href} className="rounded-2xl border border-white/10 p-6 hover:border-accent/40"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p></Link>)}</div></Section>

      <Section labelledBy="faq-title" className="border-t border-white/10"><SectionTitle id="faq-title" title="Before your first assessment." /><div className="mt-8 space-y-4">{faqs.map(faq => <details key={faq.question} className="rounded-xl border border-white/10 p-5"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p></details>)}</div></Section>
      <CtaBand title="Try the workflow on one verified application." lead="Start with staging, scoped test accounts and a question you want answered. Review current scan allowances and report access before your assessment." secondary={{ label: "View current plans", href: "/pricing" }} />
    </SiteShell>
  );
}
