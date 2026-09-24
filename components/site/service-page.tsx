import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import type { ServicePage } from "@/lib/services";
import { faqJsonLd, serviceJsonLd } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

/** One template for every expert-led service page. */
export function ServicePageView({ page }: { page: ServicePage }) {
  const crumbs = [
    { name: "Services", path: "/services" },
    { name: page.name, path: page.path },
  ];

  return (
    <SiteShell>
      <JsonLd data={serviceJsonLd({ name: page.name, description: page.metaDescription, path: page.path })} />
      <JsonLd data={faqJsonLd(page.faq)} />

      <PageHeader crumbs={crumbs} eyebrow="Expert-led service" title={page.h1} lead={page.lead}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Book a scoping call
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Or run MyPentest free
          </a>
        </div>
      </PageHeader>

      <Section labelledBy="tests-title">
        <SectionTitle id="tests-title" eyebrow="What we test" title="Scope, agreed in writing." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.tests.map((item) => (
            <li key={item.title} className="spot rounded-2xl border border-white/[0.07] bg-surface p-6">
              <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="approach-title" className="border-t border-white/[0.05] bg-surface/40">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle id="approach-title" eyebrow="How we work" title="Methodical, and never destructive without agreement." />
            <ol className="mt-8 space-y-4">
              {page.approach.map((step, index) => (
                <li key={step} className="flex gap-4 text-[15px] leading-relaxed text-muted">
                  <span className="font-mono text-[12px] text-accent">{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">What you receive</h2>
            <ul className="mt-5 space-y-3">
              {page.deliverables.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-muted">
                  <Check className="mt-1 h-4 w-4 flex-none text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/[0.05] p-6">
              <h3 className="text-sm font-semibold">Manual testing or MyPentest?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{page.automation.fits}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{page.automation.manual}</p>
              <Link href="/compare/automated-vs-manual-penetration-testing" className="mt-3 inline-block text-sm text-accent hover:underline">
                Automated vs manual penetration testing
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Questions, answered straight." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {page.faq.map((item) => (
            <details key={item.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{item.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Talk to a tester, not a sales team."
        lead="A free 30-minute scoping call, then a fixed quote in writing. Or start with a free automated pentest today."
        secondary={{ label: "Book a scoping call", href: "/contact" }}
      />
    </SiteShell>
  );
}
