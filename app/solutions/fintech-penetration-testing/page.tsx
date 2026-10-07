import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ArrowRight, Lock, Activity } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Fintech Penetration Testing: Payment Gateway & Banking API Security",
  description:
    "Scope fintech application and payment API penetration testing around transaction integrity, price validation, webhook security and authorization boundaries.",
  path: "/solutions/fintech-penetration-testing",
});

const faqs = [
  {
    question: "How does BugSnaps test payment gateways without charging real credit cards?",
    answer:
      "Agree on a dedicated sandbox, test accounts, test balances and permitted actions before the engagement. Payment workflow testing is separately scoped with BugSnaps; MyPentest automated scans do not create transactions or replace a financial business-logic review.",
  },
  {
    question: "Can a MyPentest scan certify payment security or PCI DSS compliance?",
    answer:
      "No. MyPentest provides technical findings, evidence and remediation within its defined scope. If your reviewer requires specific manual testing, methodology or signed deliverables, agree on those requirements before booking an expert engagement. Compliance certification is not included in an automated scan.",
  },
  {
    question: "Can automated testing detect payment race conditions?",
    answer:
      "MyPentest runs defined non-destructive web security checks; it does not replace transaction business-logic testing. Race-condition testing, concurrency limits and test balances must be separately discussed and agreed for an expert-led sandbox assessment.",
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
        lead="Discuss an expert-led review of payment flows, banking APIs and financial ledgers. Agree on the transaction rules, sandbox scope and evidence needed for price, currency, webhook and concurrency tests."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Securing High-Stakes Financial Transactions
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          A useful fintech testing scope describes how order totals, currencies, discounts, webhooks and account balances should behave. It also defines safe test data and permitted actions. MyPentest can assess defined web security checks; transaction integrity and business logic require a separately agreed expert review.
        </p>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <h3 className="text-lg font-semibold">Scope before promises</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">Payment business-logic review is an expert engagement with its own authorized sandbox scope. We do not publish a measured sector score or industry-average detection comparison.</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Payment Parameter Tampering</h3>
            <p className="mt-2 text-sm text-muted">
              Scope a review of server-owned amounts, currencies and order state using dedicated sandbox orders and agreed expected behavior.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Lock className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Webhook Authentication and Replay</h3>
            <p className="mt-2 text-sm text-muted">
              Discuss how to evaluate signatures, event identity, replay handling and order binding using sandbox events within the agreed scope.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Transaction Concurrency &amp; Race</h3>
            <p className="mt-2 text-sm text-muted">
              Agree on test balances, concurrency ceilings and permitted actions before any expert-led review of ledger or voucher race conditions.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Compare Coverage for Financial Workflows
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Review which checks a tool can actually perform and where operator judgment is needed. A configuration scan, an account-access check and a payment workflow review cover different risks; compare them within a common authorized scope.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              Compare automated and expert-led testing <ArrowRight className="h-3.5 w-3.5" />
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

      <CtaBand title="Define your fintech testing scope." lead="Bring your payment architecture, sandbox access and expected transaction rules to a scoping conversation." secondary={{ label: "Discuss expert-led fintech testing", href: "/contact?topic=enterprise" }} />
    </SiteShell>
  );
}
