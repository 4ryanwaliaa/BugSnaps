import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, FileCheck, Award, RefreshCw } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SiteShell } from "@/components/site/page-parts";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "SOC 2 Penetration Testing: Auditor-Approved Reports & Attestations",
  description:
    "Auditor-ready SOC 2 Type II penetration testing: satisfy AICPA Trust Services Criteria (CC4.1, CC7.1), complete remediation retests, and receive signed attestation letters.",
  path: "/solutions/soc2-penetration-testing",
});

const faqs = [
  {
    question: "Do SOC 2 auditors accept BugSnaps penetration testing reports?",
    answer:
      "Yes. BugSnaps deliverables strictly follow AICPA guidelines, providing formal Rules of Engagement, standardized CVSS v3.1 scoring, executive attestation letters, and verified retest reports accepted by all major auditing firms.",
  },
  {
    question: "What specific SOC 2 controls require penetration testing?",
    answer:
      "SOC 2 Trust Services Criteria CC4.1 (COSO Principle 16 - monitoring activities), CC7.1 (vulnerability identification), and CC7.4 (remediation of identified vulnerabilities) mandate third-party technical security evaluations.",
  },
  {
    question: "Does BugSnaps include retesting for SOC 2 compliance?",
    answer:
      "Yes. We verify developer fixes and provide a signed retest attestation proving that all critical and high-severity findings have been successfully closed before auditor submission.",
  },
];

export default function Soc2PenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/services" },
          { name: "SOC 2 Penetration Testing", path: "/solutions/soc2-penetration-testing" },
        ]}
        eyebrow="Compliance Assurance"
        title="SOC 2 Penetration Testing: Auditor-Approved Reports & Attestations"
        lead="Satisfy AICPA Trust Services Criteria CC4.1 and CC7.1 with independent, verified penetration testing deliverables built to sail through external auditor reviews."
      />

      <Section labelledBy="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">
          What SOC 2 Auditors Look For in a Pentest
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          SOC 2 Type II auditors reject raw automated vulnerability scanner dumps and internal self-attestations. They mandate an independent, third-party assessment that attempts real-world exploitation and concludes with a verified retest report demonstrating that all high-risk vulnerabilities have been closed.
        </p>

        {/* Sector Capability Benchmark */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-accent">Compliance Benchmark</span>
              <h3 className="mt-1 text-lg font-semibold">SOC 2 Auditor Acceptance &amp; Completeness Score</h3>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">95% vs 45%</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            BugSnaps provides complete auditor packages: formal methodology, executive attestation letters, and certified retests.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: "95%" }} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <FileCheck className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold">Auditor Attestation Letters</h3>
            <p className="mt-2 text-sm text-muted">
              Executive summary letters signed by security researchers, ready for direct inclusion in your SOC 2 audit package.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <Award className="h-5 w-5 text-emerald-400" />
            <h3 className="mt-3 font-semibold">Recognized Methodologies</h3>
            <p className="mt-2 text-sm text-muted">
              Assessments executed according to OWASP ASVS and NIST SP 800-115 standards required by Qualified Security Assessors.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            <h3 className="mt-3 font-semibold">Verified Retest Attestations</h3>
            <p className="mt-2 text-sm text-muted">
              Formal verification confirming that developer patches have resolved all identified critical and high vulnerabilities.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="comparison-link-title" className="border-t border-white/[0.05] bg-surface/30">
        <h2 id="comparison-link-title" className="text-2xl font-semibold tracking-tight">
          Compliance Capability Benchmarks
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Avoid the trap of buying scanners that fail auditor scrutiny. Review our complete capability metrics and vendor comparisons to ensure your audit report passes without exceptions.
          </p>
          <div className="pt-2">
            <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
              View all competitor benchmarks and sector scores <ArrowRight className="h-3.5 w-3.5" />
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
