import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, DollarSign, ArrowRight, ShieldCheck, Lock, Activity } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Fintech Penetration Testing: Payment Gateway & Banking API Security",
  description:
    "Expert penetration testing for fintech applications, payment gateways, and banking APIs: testing transaction integrity, price tampering, webhook security, and PCI DSS compliance.",
  path: "/solutions/fintech-penetration-testing",
});

const faqs = [
  {
    question: "How does BugSnaps test payment gateways without charging real credit cards?",
    answer:
      "We test against configured sandbox environments or with authorized micro-transactions, validating server-side price validation, currency checking, and webhook HMAC signature handling safely.",
  },
  {
    question: "Does BugSnaps penetration testing satisfy PCI DSS v4.0 Requirement 11.4?",
    answer:
      "Yes. BugSnaps delivers rigorous application-layer penetration tests aligned with PCI DSS v4.0 Requirement 11.4, complete with proof-of-concept evidence, CVSS v3.1 scoring, and signed retest attestation certificates.",
  },
  {
    question: "Can automated testing detect payment race conditions?",
    answer:
      "BugSnaps combines automated differential testing with expert multi-threaded concurrency harnesses to identify Time-of-Check to Time-of-Use (TOCTOU) flaws in voucher redemptions and ledger transfers.",
  },
];

export default function FintechPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "Fintech Penetration Testing", path: "/solutions/fintech-penetration-testing" },
        ]}
        eyebrow="Fintech Security"
        title="Fintech Penetration Testing: Payment Gateway & Banking API Security"
        lead="Secure payment flows, banking APIs, and financial ledgers against price tampering, currency manipulation, webhook forgery, and transaction race conditions."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Securing High-Stakes Financial Transactions
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Fintech applications handle sensitive financial data and direct monetary transactions. Attackers do not merely seek data theft; they exploit logical flaws in order totals, currency conversions, discount stacking, and asynchronous payment webhooks to extract direct financial gain.
        </p>

        {/* Sector Capability Benchmark */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Sector Benchmark</span>
              <h3 className="mt-1 text-lg font-semibold">Fintech Security Testing Capability: BugSnaps vs Industry Average</h3>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">94% vs 50%</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            BugSnaps provides deterministic validation for payment parameter tampering, currency integrity, and webhook HMAC verification.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: "94%" }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Payment Parameter Tampering</h3>
            <p className="mt-2 text-sm text-muted">
              Verify that clients cannot manipulate product prices, quantities, or fee structures during multi-step checkouts.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Lock className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Webhook HMAC Verification</h3>
            <p className="mt-2 text-sm text-muted">
              Ensure asynchronous payment gateway webhooks enforce constant-time signature verification and replay prevention.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Transaction Concurrency &amp; Race</h3>
            <p className="mt-2 text-sm text-muted">
              Probe balances, vouchers, and transfer endpoints for concurrent double-spending vulnerabilities.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Benchmark Comparison for Financial Technology
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Generic scanners create noise by alerting on cosmetic header issues while completely ignoring business logic payment tampering. BugSnaps focuses on verified transaction security.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare BugSnaps benchmarks against other security tools <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" className="border-t border-white/[0.05]">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 space-y-6 max-w-3xl">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-white/[0.06] bg-surface p-5">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
