import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaBand, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { FREE_LIMITS, LAUNCH_OFFER, SERVICE_PRICING, plans } from "@/lib/plans";
import { pageMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — Free Automated Pentesting During Launch",
  description:
    "MyPentest is free during launch: real automated penetration tests with no credit card. Advanced and enterprise plans are coming; expert-led testing is quoted per scope.",
  path: "/pricing",
});

const STATUS_LABEL = {
  available: null,
  "coming-soon": "Coming soon",
  contact: "Contact us",
} as const;

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Pricing"
        title="Start free. Pay when you need more."
        lead={`${LAUNCH_OFFER.detail} We'll announce paid plans here before they start — nothing changes for your account without notice.`}
      />

      <Section labelledBy="plans-title">
        <h2 id="plans-title" className="sr-only">
          MyPentest plans
        </h2>
        <ul className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.id} className="flex">
              <article
                className={cn(
                  "flex w-full flex-col rounded-2xl border p-7",
                  plan.highlight ? "border-accent/35 bg-accent/[0.05]" : "border-white/[0.08] bg-surface",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  {STATUS_LABEL[plan.status] && (
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-muted">
                      {STATUS_LABEL[plan.status]}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price ?? "—"}</p>
                <p className="mt-1 text-sm text-muted">{plan.priceNote}</p>
                <p className="mt-5 text-[15px] leading-relaxed text-muted">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm text-muted">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta.href}
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors",
                    plan.highlight
                      ? "bg-primary text-white hover:bg-accent"
                      : "border border-white/10 bg-white/[0.04] hover:border-white/20",
                  )}
                >
                  {plan.cta.label}
                </Link>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-muted-2">
          Free usage limits: {FREE_LIMITS.scansPerDay} scans per rolling 24 hours, {FREE_LIMITS.concurrentScans} at a time,
          up to {FREE_LIMITS.targetsPerScan} URLs and {FREE_LIMITS.crawlPages} discovered pages per scan, and a{" "}
          {FREE_LIMITS.scanHours}-hour limit per scan. They exist to keep the service fast for everyone.
        </p>
      </Section>

      <Section labelledBy="services-title" className="border-t border-white/[0.05] bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionTitle
            id="services-title"
            eyebrow="Expert-led testing"
            title={`Manual engagements: ${SERVICE_PRICING.headline.toLowerCase()}.`}
            lead={SERVICE_PRICING.detail}
          />
          <div>
            <ul className="space-y-3">
              {SERVICE_PRICING.included.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-muted">
                  <Check className="mt-1 h-4 w-4 flex-none text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="mt-6 inline-block text-sm text-accent hover:underline">
              Book a free scoping call
            </Link>
          </div>
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
