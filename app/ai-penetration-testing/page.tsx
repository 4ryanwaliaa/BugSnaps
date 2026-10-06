import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, Cpu, Layers, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { CtaBand, JsonLd, PageHeader, Section, SectionTitle, SiteShell } from "@/components/site/page-parts";
import { ORG_ID, SITE_URL, faqJsonLd, pageMetadata } from "@/lib/site";
import { newAssessmentUrl } from "@/lib/mypentest";

export const metadata: Metadata = pageMetadata({
  title: "AI Penetration Testing: Deterministic Proof-of-Exploit Autonomous Security",
  description:
    "Discover how BugSnaps combines AI attack surface discovery with deterministic proof-of-exploit DAST checks to eliminate false positives in penetration testing.",
  path: "/ai-penetration-testing",
});

const faqs = [
  {
    question: "How does BugSnaps prevent hallucinations in AI penetration testing?",
    answer:
      "BugSnaps decouples exploration from verification. Intelligent algorithms plan navigation and parameter discovery, but a finding is never confirmed by an LLM prompt. Every reported vulnerability requires deterministic mathematical proof: reflected tokens, confirmed timing differentials, out-of-band network interactions, or cross-tenant data leaks.",
  },
  {
    question: "Does BugSnaps send our application data or code to third-party AI models?",
    answer:
      "No. BugSnaps does not send your application code, database records, or HTTP request data to external third-party LLM providers. All analysis and deterministic exploit checks run locally on isolated, hardened scanning infrastructure.",
  },
  {
    question: "Does automated AI penetration testing satisfy SOC 2 and ISO 27001 requirements?",
    answer:
      "Yes. BugSnaps generates standardized vulnerability reports mapped to OWASP Top 10, CWE, and CVSS 3.1 frameworks, fulfilling continuous vulnerability assessment and technical audit requirements for SOC 2 Type II, ISO 27001:2022, and PCI DSS 4.0.",
  },
  {
    question: "When should we choose manual penetration testing over AI automation?",
    answer:
      "Automated AI testing is ideal for continuous baseline coverage, regression checks, and rapid release cycles. For complex multi-step business logic (such as payment processing workflows, multi-party escrow logic, or custom authorization hierarchies), our expert-led manual testing engagements provide comprehensive human analysis.",
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BugSnaps AI Penetration Testing Platform",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/ai-penetration-testing`,
  description:
    "Next-generation autonomous AI penetration testing engine combining adaptive attack-surface exploration with deterministic proof-of-exploit verification.",
  publisher: { "@id": ORG_ID },
};

const generations = [
  {
    generation: "Gen 1: Signature Scanners",
    era: "2000s - 2010s",
    limitations: "Rigid static signatures, immense false positive rates, and zero understanding of modern single-page applications or JavaScript state.",
  },
  {
    generation: "Gen 2: Manual DAST Proxies",
    era: "2010s - 2020s",
    limitations: "Powerful for human pentesters but labor-intensive to configure, requiring manual session recording and complex proxy chains for every scan.",
  },
  {
    generation: "Gen 3: LLM Wrappers",
    era: "2023 - 2025",
    limitations: "Superficial wrappers that feed source code or HTML into generic LLMs. Prone to severe hallucinations, token limits, and leaking private data.",
  },
  {
    generation: "Gen 4: BugSnaps Dual-Engine",
    era: "Present (2026)",
    limitations: "Adaptive browser-driven navigation paired with deterministic exploit verification. Zero hallucinated vulnerabilities and zero data leakage.",
  },
];

const architecturePillars = [
  {
    icon: BrainCircuit,
    title: "Adaptive Attack-Surface Mapper",
    body: "Dynamically explores web application state machines, inferring parameter relationships and uncovering hidden administrative endpoints across single-page apps.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic Exploit Engine",
    body: "Executes 56 safe-active vulnerability tests. Findings are recorded only when verifiable proof of exploit is captured in raw HTTP traffic.",
  },
  {
    icon: Layers,
    title: "Dual-Account Authorization Matrix",
    body: "Automates testing across distinct user roles to detect Broken Object Level Authorization (BOLA/IDOR) across tenant boundaries.",
  },
  {
    icon: Terminal,
    title: "Developer Remediation Pipeline",
    body: "Outputs clear CVSS 3.1 severity scores, exact reproduction curl commands, and patch snippets directly into CI/CD pipelines and SARIF reports.",
  },
];

export default function AiPenetrationTestingPage() {
  return (
    <SiteShell>
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHeader
        crumbs={[
          { name: "Products", path: "/products" },
          { name: "AI Penetration Testing", path: "/ai-penetration-testing" },
        ]}
        eyebrow="Offensive AI Security"
        title="AI Penetration Testing: Deterministic Proof-of-Exploit Autonomous Security"
        lead="Stop chasing hallucinated vulnerability reports. BugSnaps combines autonomous attack surface exploration with deterministic proof-of-exploit DAST verification for zero false positives."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={newAssessmentUrl()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Launch Autonomous Pentest
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/free-ai-pentesting"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Free AI Pentest Tier
          </Link>
          <Link
            href="/continuous-penetration-testing"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium transition-colors hover:border-white/20"
          >
            Continuous PTaaS
          </Link>
        </div>
      </PageHeader>

      <Section labelledBy="architecture-title">
        <SectionTitle
          id="architecture-title"
          eyebrow="Dual-Engine Architecture"
          title="How BugSnaps achieves autonomous testing without false positives."
          lead="We solve the central flaw of AI security tools: separating attack-path discovery from exploit verification."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {architecturePillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="spot flex flex-col rounded-2xl border border-white/[0.07] bg-surface p-6">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="generations-title" className="border-t border-white/[0.05] bg-surface/40">
        <SectionTitle
          id="generations-title"
          eyebrow="Industry Context"
          title="The four generations of penetration testing technology."
          lead="From static signature scanners to modern dual-engine autonomous platforms."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {generations.map((gen, index) => (
            <div key={gen.generation} className="spot rounded-2xl border border-white/[0.07] bg-surface p-6">
              <span className="font-mono text-xs text-accent">{gen.era}</span>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{gen.generation}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{gen.limitations}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="comparison-callout-title" className="border-t border-white/[0.05]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle
              id="comparison-callout-title"
              eyebrow="Proven Results"
              title="Autonomous testing benchmarked against industry standards."
              lead="BugSnaps outperforms legacy DAST scanners and generic AI wrappers in detection accuracy and verification confidence."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                In benchmark evaluations across enterprise web applications, BugSnaps delivered a 96% accuracy rate in automated BOLA detection while maintaining a strict zero-false-positive standard through deterministic proof of exploit.
              </p>
              <p>
                Every finding in your report includes reproducible curl commands, raw HTTP request and response evidence, and step-by-step developer remediation guidance.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/us-vs-competitors" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                View complete benchmark battlecards <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/penetration-testing" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
                Manual penetration testing services <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7">
            <h3 className="text-lg font-semibold tracking-tight">Compliance &amp; Attestation Standards</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>SOC 2 Type II:</strong> Satisfies CC7.1 technical vulnerability identification and management requirements.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>ISO/IEC 27001:2022:</strong> Fulfills Control A.12.6.1 management of technical vulnerabilities.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>PCI DSS v4.0:</strong> Addresses Requirement 11.3 external vulnerability assessments.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                <span><strong>OWASP ASVS Level 2:</strong> Maps directly to Application Security Verification Standard controls.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="faq-title" id="faq" className="border-t border-white/[0.05]">
        <SectionTitle id="faq-title" eyebrow="FAQ" title="Frequently asked questions about AI penetration testing." />
        <div className="mt-10 max-w-3xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                <h3>{faq.question}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Experience true autonomous penetration testing."
        lead="Run a real assessment of your application with deterministic proof of exploit and zero hallucinated findings."
        secondary={{ label: "Compare with competitor tools", href: "/us-vs-competitors" }}
      />
    </SiteShell>
  );
}
