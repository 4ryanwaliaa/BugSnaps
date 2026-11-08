import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaBand, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { PricingPlans } from "@/components/mypentest/plan-cards";
import { INTERNATIONAL_PLUS_USD_CENTS, LAUNCH_OFFER, SERVICE_PRICING, getPlans } from "@/lib/plans";
import { pageMetadata } from "@/lib/site";

const internationalPlusPrice = `US$${(INTERNATIONAL_PLUS_USD_CENTS / 100).toFixed(2)}`;

export const metadata: Metadata = pageMetadata({
  title: "Penetration Testing Pricing | MyPentest Plans",
  description:
    `Compare MyPentest's free scan and Plus plan: ₹499 in India or ${internationalPlusPrice} internationally for 2 deep scans. Request a quote for manual pentesting.`,
  path: "/pricing",
});

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Pricing"
        title="Start free. Pay when you need more."
        lead={`${LAUNCH_OFFER.detail} Plus is ₹499 in India through Razorpay or ${internationalPlusPrice} internationally through PayPal. Both include 2 deep scans with no expiry and priority support for paid users.`}
      />

      <Section labelledBy="plans-title">
        <h2 id="plans-title" className="sr-only">
          MyPentest plans
        </h2>
        <PricingPlans plans={plans} />
        <p className="mt-6 text-[13px] text-muted-2">
          Free includes 1 scan per account, up to 200 URLs and 500 discovered pages. Plus includes all finding details
          and report downloads, with no plan cap on URLs or discovery. Service limits of 10,000 tested URLs, 50,000
          discovered pages and one hour per scan still apply. India checkout uses INR; international PayPal checkout uses USD.
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
            <Link
              href="/contact?topic=pentest"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
            >
              Book a consultation
            </Link>
          </div>
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
