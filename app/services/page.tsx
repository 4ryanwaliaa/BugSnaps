import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CtaBand, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { serviceSummaries } from "@/lib/services";
import { SERVICE_PRICING } from "@/lib/plans";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security Testing Services",
  description:
    "Expert-led security services from BugSnaps: penetration testing of web apps, APIs and networks, cloud and code review, and hands-on remediation support.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Services"
        title="Expert-led security testing, scoped to what you've built."
        lead="When automation isn't enough - business logic, compliance evidence, complex permissions - our testers take it from there. Every engagement is quoted in writing before it starts."
      />

      <Section labelledBy="list-title">
        <h2 id="list-title" className="sr-only">
          All services
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSummaries.map((service) => (
            <li key={service.title} className="flex">
              <article className="flex w-full flex-col spot rounded-2xl border border-white/[0.07] bg-surface p-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  {service.href ? (
                    <Link href={service.href} className="hover:text-accent">
                      {service.title}
                    </Link>
                  ) : (
                    service.title
                  )}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{service.description}</p>
                <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-muted">
                      <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
                {service.href && (
                  <Link href={service.href} className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="pricing-title" className="border-t border-white/[0.05] bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionTitle id="pricing-title" eyebrow="Pricing" title={SERVICE_PRICING.headline} lead={SERVICE_PRICING.detail} />
          <ul className="space-y-3">
            {SERVICE_PRICING.included.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] text-muted">
                <Check className="mt-1 h-4 w-4 flex-none text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section labelledBy="solutions-title" className="border-t border-white/[0.05]">
        <SectionTitle
          id="solutions-title"
          eyebrow="Industry Solutions"
          title="Tailored testing for your industry and architecture."
          lead="Whether you're securing a multi-tenant SaaS, a fintech payment gateway, or preparing for an enterprise SOC 2 audit, BugSnaps delivers specialized testing workflows."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/solutions/saas-penetration-testing" className="group rounded-2xl border border-white/[0.07] bg-surface p-5 transition-colors hover:border-white/15">
            <h3 className="font-semibold group-hover:text-accent">SaaS Penetration Testing</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">Cross-tenant BOLA, invitation boundaries, and role hierarchy testing.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">Learn more →</span>
          </Link>
          <Link href="/solutions/fintech-penetration-testing" className="group rounded-2xl border border-white/[0.07] bg-surface p-5 transition-colors hover:border-white/15">
            <h3 className="font-semibold group-hover:text-accent">Fintech &amp; Payment Testing</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">Price tampering, webhook HMAC forgery, and ledger race conditions.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">Learn more →</span>
          </Link>
          <Link href="/solutions/startup-penetration-testing" className="group rounded-2xl border border-white/[0.07] bg-surface p-5 transition-colors hover:border-white/15">
            <h3 className="font-semibold group-hover:text-accent">Penetration Testing for Startups</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">Rapid, affordable assessments to pass enterprise vendor risk reviews.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">Learn more →</span>
          </Link>
          <Link href="/solutions/soc2-penetration-testing" className="group rounded-2xl border border-white/[0.07] bg-surface p-5 transition-colors hover:border-white/15">
            <h3 className="font-semibold group-hover:text-accent">SOC 2 Compliance Pentesting</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">AICPA CC4.1 &amp; CC7.1 mapping, auditor letters, and retest attestations.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">Learn more →</span>
          </Link>
          <Link href="/solutions/api-penetration-testing" className="group rounded-2xl border border-white/[0.07] bg-surface p-5 transition-colors hover:border-white/15">
            <h3 className="font-semibold group-hover:text-accent">API Penetration Testing</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">REST, GraphQL query depth, mass assignment, and token privilege boundaries.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">Learn more →</span>
          </Link>
          <Link href="/us-vs-competitors" className="group rounded-2xl border border-accent/25 bg-accent/[0.05] p-5 transition-colors hover:border-accent/40">
            <h3 className="font-semibold text-accent">Sector Benchmarks &amp; Competitors</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">See how BugSnaps compares against legacy DAST and AI tools across sectors.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">View benchmarks →</span>
          </Link>
        </div>
      </Section>

      <Section labelledBy="individuals-title" className="border-t border-white/[0.05]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/[0.08] bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 id="individuals-title" className="text-lg font-semibold tracking-tight">For individuals: BugSnaps Personal</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Find the accounts and data-broker listings tied to your identity, and remove them - consent-first, using
              official platform processes.
            </p>
          </div>
          <Link href="/personal" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-5 text-sm hover:border-white/20">
            Explore BugSnaps Personal
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
