import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { SECURITY_USE_CASES, useCasePath } from "@/lib/security-use-cases";
import { absoluteUrl, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Use Cases and Practical Test Plans",
  description: "Security testing plans for SaaS, ecommerce, APIs, healthcare, fintech and small teams. Scope accounts, evidence, workflows, automation limits and manual review.",
  path: "/use-cases",
});

export default function SecurityUseCasesHub() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Security testing use cases",
    numberOfItems: SECURITY_USE_CASES.length,
    itemListElement: SECURITY_USE_CASES.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: absoluteUrl(useCasePath(item.slug)) })),
  };
  return (
    <SiteShell>
      <JsonLd data={list} />
      <PageHeader crumbs={[{ name: "Use cases", path: "/use-cases" }]} eyebrow="Security testing use cases" title="A test plan for the way your application works." lead="Choose a workflow, prepare the right accounts and define the evidence you need. These plans combine an authorized automated baseline with specific decisions about manual review." />
      <Section labelledBy="plans-title">
        <SectionTitle id="plans-title" title={`${SECURITY_USE_CASES.length} practical security testing plans.`} lead="Each plan covers assets, roles, preparation, report evidence and the limits of automation. Choose by application architecture or the decision your team needs to make." />
        <ul className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SECURITY_USE_CASES.map((item) => <li key={item.slug} className="flex">
            <Link href={useCasePath(item.slug)} className="flex w-full flex-col rounded-2xl border border-white/[0.08] bg-surface p-6 hover:border-white/20">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-2">{item.label}</span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-accent">Read the testing plan <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          </li>)}
        </ul>
      </Section>
      <Section labelledBy="choose-title" className="border-t border-white/[0.05] bg-surface/30">
        <SectionTitle id="choose-title" title="Choose the plan by the boundary you need to test." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div><h3 className="text-lg font-semibold">Customer data boundaries</h3><p className="mt-3 text-sm leading-relaxed text-muted">Use the SaaS, multi-tenant or authenticated plans when the question is who can access a customer's record, organization or privileged action.</p></div>
          <div><h3 className="text-lg font-semibold">Transactions and state changes</h3><p className="mt-3 text-sm leading-relaxed text-muted">Use the ecommerce or fintech plan when permissions alone are insufficient and a payment, approval, cancellation or retry can change value.</p></div>
          <div><h3 className="text-lg font-semibold">Release and delivery decisions</h3><p className="mt-3 text-sm leading-relaxed text-muted">Use the pre-launch, agency or release validation plan to tie a scoped assessment to a known deployment, repair owner and retest result.</p></div>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">A useful report says what was tested and where access or coverage was missing. These plans describe a testing approach; they do not imply industry certification or that every step is an automated MyPentest feature.</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm"><Link href="/guides" className="text-accent hover:underline">Browse security testing guides</Link><Link href="/compare" className="text-accent hover:underline">Compare testing tools and approaches</Link><Link href="/mypentest/example-report" className="text-accent hover:underline">See an example report</Link></div>
      </Section>
    </SiteShell>
  );
}
