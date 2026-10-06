import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Layers, Users, Key, Zap } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "SaaS Penetration Testing: Multi-Tenant & API Security Testing",
  description:
    "Comprehensive SaaS penetration testing for multi-tenant applications: cross-tenant BOLA/IDOR detection, role hierarchies, token revocation, and compliance attestations.",
  path: "/solutions/saas-penetration-testing",
});

const faqs = [
  {
    question: "What makes SaaS penetration testing unique compared to traditional testing?",
    answer:
      "SaaS testing must focus primarily on multi-tenant isolation and broken object level authorization (BOLA). A single tenant boundary bypass can expose thousands of customer organizations simultaneously.",
  },
  {
    question: "How does BugSnaps test multi-tenant boundaries?",
    answer:
      "BugSnaps uses automated dual-account cross-tenant verification, generating test records with Tenant A and systematically attempting access using Tenant B's credentials to confirm access control decisions.",
  },
  {
    question: "Can BugSnaps test SaaS staging environments?",
    answer:
      "Yes. BugSnaps safely tests staging and pre-production environments using cryptographic DNS verification, rate pacing, and non-destructive payloads.",
  },
];

export default function SaasPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "SaaS Penetration Testing", path: "/solutions/saas-penetration-testing" },
        ]}
        eyebrow="Industry Solutions"
        title="SaaS Penetration Testing: Multi-Tenant & API Security Testing"
        lead="Protect your multi-tenant SaaS architecture against cross-organization data leakage, BOLA, privilege escalation, and session hijacking before enterprise procurement reviews."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          Why Multi-Tenant SaaS Requires Dedicated Security Testing
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          In a Software-as-a-Service model, your application hosts data from hundreds or thousands of competing businesses in shared databases. A single missing `WHERE org_id = ?` clause can expose proprietary financial, customer, or employee records. Standard scanners miss these flaws because they lack multi-tenant awareness.
        </p>

        {/* Sector Capability Benchmark */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Sector Benchmark</span>
              <h3 className="mt-1 text-lg font-semibold">SaaS Security Testing Capability: BugSnaps vs Legacy Scanners</h3>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">96% vs 45%</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            BugSnaps leads the industry in automated cross-tenant BOLA detection and session state validation.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: "96%" }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Users className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Tenant Boundary Testing</h3>
            <p className="mt-2 text-sm text-muted">
              Verify that users in Organization A cannot view, update, or export records belonging to Organization B.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Key className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Role Privilege Escalation</h3>
            <p className="mt-2 text-sm text-muted">
              Test whether read-only members can perform billing, team invitation, or administrative actions via direct API calls.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Zap className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Session &amp; Token Lifecycles</h3>
            <p className="mt-2 text-sm text-muted">
              Ensure tokens are properly revoked upon member removal, password reset, or organizational downgrade.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          How BugSnaps Outperforms Legacy Scanners in SaaS
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Traditional scanners only test single-user unauthenticated pages, completely missing tenant boundaries. BugSnaps MyPentest incorporates paired-account validation and deep API parsing, delivering verifiable proof of exploit.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              See complete sector benchmarks &amp; competitor comparison <ArrowRight className="h-3.5 w-3.5" />
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
