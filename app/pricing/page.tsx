import type { Metadata } from "next";
import Link from "next/link";
import { Check, CreditCard, LockOpen, Mail, RotateCcw, ScanSearch, ShieldCheck, Timer } from "lucide-react";
import { CtaBand, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { PricingPlans } from "@/components/mypentest/plan-cards";
import {
  FALLBACK_PLANS,
  INTERNATIONAL_USD_CENTS,
  SERVICE_PRICING,
  UNLOCK_PRICE_INR,
  formatPrice,
  getPlans,
} from "@/lib/plans";
import { CONTACT_EMAIL, pageMetadata } from "@/lib/site";
import { routes } from "@/lib/mypentest";
import { visitorRegion } from "@/lib/region";

const plusInr = FALLBACK_PLANS.find((p) => p.id === "plus")?.price ?? 0;
const unlockInr = formatPrice(UNLOCK_PRICE_INR, "INR");
const unlockUsd = `US$${(INTERNATIONAL_USD_CENTS.unlock / 100).toFixed(2)}`;
const plusUsd = `US$${(INTERNATIONAL_USD_CENTS.plus / 100).toFixed(2)}`;

export const metadata: Metadata = pageMetadata({
  title: "Penetration Testing Pricing | MyPentest Plans",
  description: `Scan your website free. Unlock serious findings for ${unlockInr} (${unlockUsd}), or get Plus: 2 full pentests for ${formatPrice(plusInr, "INR")} (${plusUsd}). One-time payments, no subscription.`,
  path: "/pricing",
});

const STEPS = [
  {
    icon: ScanSearch,
    title: "Scan free",
    text: "Prove you own the domain and MyPentest maps and tests it. No card needed.",
  },
  {
    icon: Timer,
    title: "See what it found",
    text: "Medium and low findings in full. Critical and high ones are counted, so you know they're there.",
  },
  {
    icon: LockOpen,
    title: "Unlock only if it matters",
    text: `The unlock appears only when your scan found something serious. ${unlockInr} shows it all, with fixes.`,
  },
];

const PROMISES = [
  { icon: RotateCcw, title: "No subscription", text: "Pay once. Nothing renews, nothing to cancel. Scan packs never expire." },
  {
    icon: ShieldCheck,
    title: "Refund if it fails",
    text: "If a paid scan can't complete because of us, you get the scan back or your money back.",
    href: "/refund-policy",
  },
  {
    icon: CreditCard,
    title: "Checkout you know",
    text: "Razorpay in India (UPI, cards, netbanking), PayPal elsewhere. We never see your card details.",
  },
  {
    icon: Timer,
    title: "Private by design",
    text: "Results are deleted 24 hours after the scan. We don't keep a copy of what we found.",
  },
];

const FAQ = [
  {
    q: "What if the free scan finds nothing serious?",
    a: "Then you don't pay anything. The unlock is only offered when the scan counted critical or high findings, so you never pay to open an empty report. Your medium and low findings are already shown in full.",
  },
  {
    q: "What's the difference between an unlock and Plus?",
    a: "An unlock shows the hidden findings in the report you already have. Plus, bought from that report, unlocks it too and adds 2 full scans: run one after you fix things to confirm the fixes worked.",
  },
  {
    q: "Is it a subscription?",
    a: "No. Every purchase is a one-time payment. Nothing renews automatically, and unused scans stay on your account with no expiry.",
  },
  {
    q: "Will a scan break my site?",
    a: "No. MyPentest only sends harmless probes. It never exploits, deletes or changes your data, runs no denial-of-service or password guessing, and only tests domains you've proved you own.",
  },
  {
    q: "What if my payment goes through but something breaks?",
    a: "Don't pay again. Reload the billing page and it confirms the payment, or email us the payment ID. If a report you paid to unlock is gone, the payment becomes a full scan automatically.",
  },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ region?: string | string[] }> }) {
  // Razorpay in ₹ for visitors in India, PayPal in US$ elsewhere (Vercel's
  // country header); ?region= is the visitor's own correction and wins.
  const [plans, region] = await Promise.all([getPlans(), searchParams.then((p) => visitorRegion(p.region))]);

  return (
    <SiteShell>
      <PageHeader
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Pricing"
        title="Find out what's exposed. Free."
        lead={`Run a free scan of your website. If it finds something serious, unlock the details for ${unlockInr}, or get Plus to unlock it and run 2 full pentests. One-time payments. Nothing renews.`}
      />

      <Section labelledBy="plans-title">
        <h2 id="plans-title" className="sr-only">
          MyPentest plans
        </h2>
        <PricingPlans plans={plans} region={region} />
        <p className="mx-auto mt-6 max-w-6xl text-[13px] text-muted-2">
          The free plan includes one scan per account, up to 200 URLs and 500 discovered pages. Paid scans have no plan
          cap on URLs or pages; each scan still runs for at most one hour. India checkout is in ₹, international
          checkout in US$.
        </p>
      </Section>

      <Section labelledBy="how-title" className="border-t border-white/[0.05]">
        <SectionTitle
          id="how-title"
          eyebrow="How paying works"
          title="You only pay once you've seen there's a problem."
        />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="min-w-0 rounded-2xl border border-white/[0.08] bg-surface p-6">
              <span className="font-mono text-[12px] text-muted-2">0{i + 1}</span>
              <Icon className="mt-3 h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="promises-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle id="promises-title" eyebrow="Before you pay" title="What we promise." />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text, href }) => (
            <li key={title} className="min-w-0 rounded-2xl border border-white/[0.08] bg-background/60 p-6">
              <Icon className="h-5 w-5 text-success" aria-hidden="true" />
              <h3 className="mt-3 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{text}</p>
              {href && (
                <Link href={href} className="mt-3 inline-block text-[13px] text-accent hover:underline">
                  Read the refund policy
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-background/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight">Who&apos;s behind MyPentest</h3>
            <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              MyPentest is built by BugSnaps, founded by Aryan Walia, a CEH-certified penetration tester. Questions
              before you buy? Email directly and you&apos;ll hear back from the person who built it.
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium transition-colors hover:border-white/20"
            >
              <Mail className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="truncate">{CONTACT_EMAIL}</span>
            </a>
            <Link href="/about" className="inline-flex h-10 items-center px-2 text-sm text-accent hover:underline">
              About BugSnaps
            </Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Questions people ask before paying." />
        <div className="mt-8 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-surface">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center">
          <a
            href={routes.newAssessment}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Start your free scan
          </a>
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
